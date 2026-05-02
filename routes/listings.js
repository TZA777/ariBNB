// =======================
// BASIC SETUP
// =======================

const express = require("express");
const router = express.Router(); // creates modular router instead of using app


// =======================
// MODELS (DB interaction)
// =======================

const Listing = require("../models/listings");
const Review = require("../models/reviews.js");
const User = require("../models/user.js");
// 👉 Only Listing is mainly used here (others may be used in controllers)


// =======================
// UTILITIES
// =======================

const wrapAsync = require("../utiles/wrapAsync.js"); 
// 👉 wraps async functions to avoid try-catch everywhere

const ExpressError = require("../utiles/ExpressError");


// =======================
// MIDDLEWARE (SECURITY + VALIDATION)
// =======================

const { isLoggedin, isOwner, validateListing } = require("../middelware.js");
// isLoggedin → user must be logged in
// isOwner → only owner can modify/delete
// validateListing → Joi validation


// =======================
// CONTROLLER (BUSINESS LOGIC)
// =======================

const listingController = require("../controllers/listings.js");
// 👉 keeps routes clean (logic is moved to controller)


// =======================
// FILE UPLOAD (MULTER + CLOUDINARY)
// =======================

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });
// 👉 uploads file directly to Cloudinary instead of local storage


// =======================
// ROUTES: /listings
// =======================

router
  .route("/")

  // GET /listings → show all listings
  .get(wrapAsync(listingController.index))

  // POST /listings → create new listing
  .post(
    isLoggedin, // user must login first

    upload.single("listing[image][url]"), 
    // 👉 handles file upload
    // ⚠ must match <input name="listing[image][url]">

    validateListing, // validate form data using Joi

    wrapAsync(listingController.createRouter) 
    // 👉 create new listing in DB
  );


// =======================
// ROUTE: SHOW CREATE FORM
// =======================

router.get(
  "/new",
  isLoggedin, // only logged-in users can create listing
  wrapAsync(listingController.renderNewRoute)
);


// =======================
// ROUTES: /listings/:id
// =======================

router
  .route("/:id")

  // GET /listings/:id → show single listing
  .get(wrapAsync(listingController.renderShowRoute))

  // PUT /listings/:id → update listing
  .put(
    isLoggedin, // must be logged in
    isOwner,    // must be owner of listing

    upload.single("listing[image][url]"), 
    // 👉 upload new image if provided

    validateListing, // validate updated data

    wrapAsync(listingController.updateRouter)
  )

  // DELETE /listings/:id → delete listing
  .delete(
    isLoggedin, 
    isOwner, 
    wrapAsync(listingController.destroyRoute)
  );


// =======================
// ROUTE: EDIT FORM
// =======================

router.get(
  "/:id/edit",
  isLoggedin, // must login
  isOwner,    // only owner can edit
  wrapAsync(listingController.renderEditRouter)
);


// =======================
// EXPORT ROUTER
// =======================

module.exports = router;