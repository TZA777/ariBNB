// =======================
// IMPORT MODEL
// =======================

// User model → used for authentication (with passport-local-mongoose)
const User = require("../models/user");


// =======================
// RENDER SIGNUP PAGE
// =======================

module.exports.renderSignup = (req, res) => {
  // Render signup form page
  res.render("users/signup.ejs");
};


// =======================
// HANDLE SIGNUP (REGISTER USER)
// =======================

module.exports.signup = async (req, res, next) => {
  try {
    // Extract user data from form
    let { username, email, password } = req.body;

    // Create new user instance (without password)
    const newUser = new User({ username, email });

    // Register user using passport-local-mongoose
    // 👉 This automatically:
    // - hashes password
    // - stores user in DB
    const registeredUser = await User.register(newUser, password);

    // Automatically log the user in after signup
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err); // pass error to global handler
      }

      // Flash success message
      req.flash("success", "welcome to AIRBNB");

      // Redirect to listings page
      return res.redirect("/listings");
    });

  } catch (e) {
    // If error occurs (e.g., duplicate username)

    req.flash("error", e.message);

    // Redirect user (⚠️ usually better to redirect to signup page)
    return res.redirect("/listings");
  }
};


// =======================
// RENDER LOGIN PAGE
// =======================

module.exports.renderLogin = (req, res) => {
  // Render login form
  res.render("users/login.ejs");
};


// =======================
// HANDLE LOGIN (AFTER PASSPORT AUTH)
// =======================

module.exports.login = async (req, res) => {

  // Flash success message
  req.flash("success", "Logged in, Welcome to AIRBNB");

  // Get redirect URL saved before login
  const redirectUrl = res.locals.redirectUrl || "/listings";

  // Redirect user to original page or default
  res.redirect(redirectUrl);
};


// =======================
// LOGOUT USER
// =======================

module.exports.logout = (req, res, next) => {

  // Passport logout → removes user session
  req.logout((err) => {

    if (err) {
      return next(err); // handle error
    }

    // Flash message
    req.flash("success", "you are logged out!");

    // Redirect to listings page
    res.redirect("/listings");
  });
};