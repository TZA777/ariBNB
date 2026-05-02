// =======================
// ENV CONFIGURATION
// =======================

// Load environment variables from .env file
// Only in development (not in production like Render/Heroku)
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}


// =======================
// IMPORTING DEPENDENCIES
// =======================

const express = require("express");            // Web framework
const app = express();

const path = require("path");                  // For handling file paths
const methodOverride = require("method-override"); // Allows PUT/DELETE from forms
const ejsMate = require("ejs-mate");           // Layout support for EJS

const mongoose = require("mongoose");          // MongoDB ORM

const ExpressError = require("./utiles/ExpressError"); // Custom error class

// ROUTES
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// AUTH + SESSION
const session = require("express-session");    // Session middleware
const MongoStore = require("connect-mongo");   // Store session in MongoDB
const flash = require("connect-flash");        // Flash messages

const passport = require("passport");          // Authentication
const LocalStrategy = require("passport-local"); // Username/password strategy
const User = require("./models/user.js");      // User model

const PORT = process.env.PORT || 8080;


// =======================
// VIEW ENGINE SETUP
// =======================

// Set EJS as template engine
app.set("view engine", "ejs");

// Set views folder path
app.set("views", path.join(__dirname, "views"));

// Use ejs-mate for layouts (like header/footer reuse)
app.engine("ejs", ejsMate);


// =======================
// MIDDLEWARE SETUP
// =======================

// Parse form data (req.body)
app.use(express.urlencoded({ extended: true }));

// Allows PUT & DELETE methods using ?_method=PUT
app.use(methodOverride("_method"));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "/public")));


// =======================
// DATABASE CONNECTION
// =======================

// Get MongoDB URL from .env
const dburl = process.env.ATLASDB_URL;


// =======================
// SESSION STORE SETUP
// =======================

// Store sessions in MongoDB instead of memory
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,  // Encrypt session data
  },
  touchAfter: 24 * 3600,         // Update session only once per day
});

// Handle session store errors
store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION", err);
});


// =======================
// SESSION CONFIGURATION
// =======================

const sessionOptions = {
  store,                          // Use MongoDB store
  secret: process.env.SECRET,     // Secret key for signing session ID
  resave: false,                  // Don't save unchanged sessions
  saveUninitialized: true,        // Save new sessions
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    maxAge: 7 * 24 * 60 * 60 * 1000,               // 7 days duration
    httpOnly: true,                                // Prevent JS access (security)
  },
};


// Apply session middleware
app.use(session(sessionOptions));

// Enable flash messages
app.use(flash());


// =======================
// PASSPORT AUTH SETUP
// =======================

// Initialize passport
app.use(passport.initialize());

// Enable session support in passport
app.use(passport.session());

// Use local strategy (username + password)
passport.use(new LocalStrategy(User.authenticate()));

// Store user info in session
passport.serializeUser(User.serializeUser());

// Retrieve user from session
passport.deserializeUser(User.deserializeUser());


// =======================
// GLOBAL VARIABLES (FOR VIEWS)
// =======================

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // success messages
  res.locals.error = req.flash("error");     // error messages
  res.locals.currUser = req.user;            // current logged-in user
  next();
});


// =======================
// DATABASE CONNECTION FUNCTION
// =======================

main()
  .then(() => {
    console.log("connection established with database");
  })
  .catch((err) => console.log(err));

// Async function to connect MongoDB
async function main() {
  console.log("DB connecting");
  await mongoose.connect(dburl); // Connect using Atlas URL
}


// =======================
// ROUTES
// =======================

// Test error route
app.get("/error", async (req, res, next) => {
  next(new ExpressError(401, "status")); // trigger custom error
  res.send("hi"); // (this won't run because error is thrown)
});

// Home route → redirect to listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Use routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// =======================
// ERROR HANDLING
// =======================

// Global error handler
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error/error.ejs", { message });
});


// =======================
// SERVER START
// =======================

// Start server on port 8080
app.listen(PORT, () => {
  console.log("listening to the port 8080");
});