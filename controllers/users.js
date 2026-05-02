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
    const registeredUser = await User.register(newUser, password);

    // Automatically log the user in after signup
    // We wrap req.login in a promise so we can 'await' it correctly
    await new Promise((resolve, reject) => {
      req.login(registeredUser, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Flash success message and save session explicitly before redirect
    req.flash("success", "Welcome to AIRBNB");
    req.session.save((err) => {
      if (err) return next(err);
      res.redirect("/listings");
    });

  } catch (e) {
    // If error occurs (e.g., duplicate username)
    req.flash("error", e.message);

    // Redirect user back to signup page on error
    req.session.save(() => {
      res.redirect("/signup");
    });
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
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect(redirectUrl);
  });
};


// =======================
// LOGOUT USER
// =======================

module.exports.logout = async (req, res, next) => {
  // Passport logout → removes user session
  // Wrap in promise for await support
  await new Promise((resolve, reject) => {
    req.logout((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  req.flash("success", "you are logged out!");
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
};