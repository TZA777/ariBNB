const express = require("express");
const router = express.Router();

const User = require("../models/user");
const wrapAsync = require("../utiles/wrapAsync");
const passport = require("passport");

const { saveRedirectUrl } = require("../middelware");
const userController = require("../controllers/users");

router
  .route("/signup")
  .get(wrapAsync(userController.renderSignup))
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(wrapAsync(userController.renderLogin))
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login)
  );

router.get("/logout", wrapAsync(userController.logout));

module.exports = router;
