const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ username, email });
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
    req.flash("error", e.message);

    // Redirect user back to signup page on error
    req.session.save(() => {
      res.redirect("/signup");
    });
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Logged in, Welcome to AIRBNB");

  const redirectUrl = res.locals.redirectUrl || "/listings";

  // Redirect user to original page or default
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect(redirectUrl);
  });
};

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
