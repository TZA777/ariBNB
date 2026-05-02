// =======================
// IMPORT MODELS & UTILITIES
// =======================

// Import Listing model (used to access listings collection in MongoDB)
const Listing = require("./models/listings");

// Import Review model (used to access reviews collection)
const Review = require("./models/reviews");

// Import Joi validation schemas
// These define rules for validating incoming request data
const { listingSchema, reviewSchema } = require("./joiSchema");

// Custom error class (used for structured error handling)
const ExpressError = require("./utiles/ExpressError");


// =======================
// AUTH CHECK MIDDLEWARE
// =======================

module.exports.isLoggedin = (req, res, next) => {

  // Passport method → checks if user is authenticated (logged in)
  if (!req.isAuthenticated()) {

    // Save the URL user originally wanted to visit
    // So after login, we can redirect them back
    req.session.redirectUrl = req.originalUrl;

    // Flash message → temporary message stored in session
    req.flash("error", "You must be logged in");

    // Redirect user to login page
    return res.redirect("/login");
  }

  // If logged in → continue to next middleware/route
  next();
};


// =======================
// SAVE REDIRECT URL TO LOCALS
// =======================

module.exports.saveRedirectUrl = (req, res, next) => {

  // If redirect URL exists in session
  if (req.session.redirectUrl) {

    // Store it in res.locals → accessible in EJS views
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  // Move to next middleware
  next();
};


// =======================
// AUTHORIZATION: CHECK OWNER OF LISTING
// =======================

module.exports.isOwner = async (req, res, next) => {

  // Extract listing ID from URL params
  let { id } = req.params;

  // Fetch listing from database
  let listing = await Listing.findById(id);

  // If listing doesn't exist
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Compare listing owner with current logged-in user
  if (!listing.owner._id.equals(res.locals.currUser._id)) {

    // If not owner → deny action
    req.flash("error", "You are not owner of listing, action denied");

    // Redirect back to listing page
    return res.redirect(`/listings/${id}`);
  }

  // If owner → allow action
  next();
};


// =======================
// VALIDATE LISTING DATA (JOI)
// =======================

module.exports.validateListing = (req, res, next) => {

  // Validate incoming request body using Joi schema
  let { error } = listingSchema.validate(req.body);

  // If validation fails
  if (error) {

    // Extract all error messages and join them into one string
    let errMsg = error.details.map((el) => el.message).join(",");

    console.log("err found in server validation");

    // Throw custom error (400 Bad Request for validation)
    throw new ExpressError(400, errMsg);

  } else {
    // If valid → continue
    next();
  }
};


// =======================
// VALIDATE REVIEW DATA (JOI)
// =======================

module.exports.validateReview = (req, res, next) => {

  // Validate review data
  // { convert: true } → automatically converts types (e.g., "5" → number 5)
  let { error } = reviewSchema.validate(req.body, { convert: true });

  // If validation fails
  if (error) {

    let errMsg = error.details.map((el) => el.message).join(",");

    console.log("err found in server validation");

    // Throw error (400 Bad Request)
    throw new ExpressError(400, errMsg);

  } else {
    // If valid → continue
    next();
  }
};


// =======================
// AUTHORIZATION: CHECK REVIEW AUTHOR
// =======================

module.exports.isAuthor = async (req, res, next) => {

  // Extract listing ID and review ID from params
  let { id, reviewId } = req.params;

  // Fetch review from database
  let review = await Review.findById(reviewId);

  // If review doesn't exist
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  // Check if current user is the author of the review
  if (!review.author._id.equals(res.locals.currUser._id)) {

    // If not author → deny action
    req.flash("error", "You are not author of review, action denied");

    // Redirect back to listing page
    return res.redirect(`/listings/${id}`);
  }

  // If author → allow action
  next();
};