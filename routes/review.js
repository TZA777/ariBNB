// =======================
// BASIC SETUP
// =======================

const express = require("express");

// mergeParams: true → allows access to parent route params (like :id from /listings/:id/reviews)
const router = express.Router({ mergeParams: true });


// =======================
// MODELS (DB interaction)
// =======================

const Listing = require("../models/listings");
const Review = require("../models/reviews.js");
// 👉 Review is mainly used here (Listing may be used in controller)


// =======================
// UTILITIES
// =======================

const wrapAsync = require("../utiles/wrapAsync.js"); 
// 👉 wraps async functions to automatically catch errors

const ExpressError = require("../utiles/ExpressError");


// =======================
// MIDDLEWARE (AUTH + VALIDATION)
// =======================

const { isLoggedin, validateReview, isAuthor } = require("../middelware.js");
// isLoggedin → user must be logged in
// validateReview → Joi validation for review data
// isAuthor → only review author can delete


// =======================
// CONTROLLER
// =======================

const reviewController = require("../controllers/reviews.js");
// 👉 keeps route clean, logic handled separately


// =======================
// ROUTES: /listings/:id/reviews
// =======================

router
  .route("/")

  // GET → render reviews (or listing with reviews)
  .get(wrapAsync(reviewController.reviewRenderShow))

  // POST → create a new review
  .post(
    isLoggedin,       // user must be logged in
    validateReview,   // validate review input (rating, comment, etc.)
    wrapAsync(reviewController.createReview) // create review in DB
  );


// =======================
// DELETE REVIEW
// =======================

router.delete(
  "/:reviewId",

  isLoggedin, // must be logged in

  isAuthor,   // must be the author of the review

  wrapAsync(reviewController.destroyReview) 
  // 👉 deletes review from DB and updates listing
);


// =======================
// EXPORT ROUTER
// =======================

module.exports = router;