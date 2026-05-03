const express = require("express");
const router = express.Router();

const Listing = require("../models/listings");
const Review = require("../models/reviews.js");
const User = require("../models/user.js");

const wrapAsync = require("../utiles/wrapAsync.js");
const ExpressError = require("../utiles/ExpressError");

const { isLoggedin, isOwner, validateListing } = require("../middelware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedin,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createRouter)
  );

router.get("/new", isLoggedin, wrapAsync(listingController.renderNewRoute));

router
  .route("/:id")
  .get(wrapAsync(listingController.renderShowRoute))
  .put(
    isLoggedin,
    isOwner,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.updateRouter)
  )
  .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyRoute));
  

router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.renderEditRouter)
);

module.exports = router;
