// =======================
// BASIC SETUP
// =======================

const express = require("express");
const router = express.Router(); // creates a modular router


// =======================
// IMPORTS
// =======================

const User = require("../models/user"); 
// 👉 User model (used in controller for signup/login)

const wrapAsync = require("../utiles/wrapAsync");
// 👉 wraps async functions to avoid try-catch everywhere

const passport = require("passport");
// 👉 handles authentication (login system)


// =======================
// MIDDLEWARE
// =======================

const { saveRedirectUrl } = require("../middelware");
// 👉 saves original URL user tried to access before login


// =======================
// CONTROLLER
// =======================

const userController = require("../controllers/users");
// 👉 contains actual logic (signup, login, logout)


// =======================
// SIGNUP ROUTES
// =======================

router
  .route("/signup")

  // GET → render signup form
  .get(wrapAsync(userController.renderSignup))

  // POST → create new user account
  .post(wrapAsync(userController.signup));


// =======================
// LOGIN ROUTES
// =======================

router
  .route("/login")

  // GET → render login form
  .get(wrapAsync(userController.renderLogin))

  // POST → login user
  .post(
    saveRedirectUrl, 
    // 👉 store original URL before authentication

    passport.authenticate("local", {
      failureRedirect: "/login", // if login fails → redirect back
      failureFlash: true,        // show error message
    }),
    // 👉 verifies username & password using LocalStrategy

    wrapAsync(userController.login)
    // 👉 runs only if authentication is successful
    // usually used to redirect user after login
  );


// =======================
// LOGOUT ROUTE
// =======================

router.get(
  "/logout",
  wrapAsync(userController.logout)
  // 👉 logs user out (removes session) and redirects
);


// =======================
// EXPORT ROUTER
// =======================

module.exports = router;