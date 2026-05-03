if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const mongoose = require("mongoose");

const ExpressError = require("./utiles/ExpressError");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

const dburl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dburl,
  /* crypto: {
    secret: process.env.SECRET,
  }, */
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expries: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

main()
  .then(() => {
    console.log("conection established with database");
  })
  .catch((err) => console.log(err));

async function main() {
  console.log("DB connecting");
  await mongoose.connect(dburl);
}

app.get("/error", async (req, res, next) => {
  return next(new ExpressError(401, "status")); // trigger custom error and STOP
});

app.get("/", (req, res) => {
  res.redirect("/listings");
  // OR res.render("home"); if you want a homepage
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.use("/", (req, res, next) => {
//   res.status(404).render("error/error.ejs", {
//     err,
//   });
// });

// app.use(async (err, req, res, next) => {
//   let { status = 500, message = "default message" } = err;
//   res.status(status).send(err);
// });

app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error/error.ejs", { err: message });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("listening to the port 8080");
});
