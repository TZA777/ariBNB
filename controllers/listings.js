// =======================
// IMPORT MODEL
// =======================

// Listing model → used to interact with listings collection in MongoDB
const Listing = require("../models/listings");


// =======================
// MAPBOX GEOCODING SETUP
// =======================

// Import Mapbox geocoding service
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Get token from .env
const mapToken = process.env.MAPBOX_TOKEN;

// Create geocoding client (used to convert location → coordinates)
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// =======================
// GET ALL LISTINGS
// =======================

module.exports.index = async (req, res) => {
  // Fetch all listings from DB
  let allListings = await Listing.find({});

  // Render index page with data
  res.render("listings/index.ejs", { allListings });
};


// =======================
// RENDER NEW LISTING FORM
// =======================

module.exports.renderNewRoute = (req, res) => {
  // Show form to create new listing
  res.render("listings/new.ejs");
};


// =======================
// CREATE NEW LISTING
// =======================

module.exports.createRouter = async (req, res, next) => {

  // Convert user-entered location (text) → coordinates using Mapbox
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location, // location string from form
      limit: 1, // get only one best match
    })
    .send();

  // Check if geocoding was successful
  if (!response.body.features.length) {
    req.flash("error", "Invalid location provided");
    return res.redirect("/listings/new");
  }

  // Get uploaded image info from multer + Cloudinary
  if (!req.file) {
    req.flash("error", "Please upload an image");
    return res.redirect("/listings/new");
  }

  let url = req.file.path;       // Cloudinary URL
  let filename = req.file.filename;

  // Get form data
  let data = req.body.listing;


  // Create new listing instance
  let newListing = new Listing(data);

  // Attach image to listing
  newListing.image = { url, filename };

  // Attach current logged-in user as owner
  newListing.owner = req.user._id;

  // Save geocoded coordinates
  newListing.geometry = response.body.features[0].geometry;


  // Save listing in DB
  let newUpdatedListing = await newListing.save();
  console.log(newUpdatedListing);


  // Flash success message
  req.flash("success", "New Listing Created");

  // Redirect to listings page
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
};


// =======================
// RENDER EDIT FORM
// =======================

module.exports.renderEditRouter = async (req, res, next) => {
  let { id } = req.params;

  // Find listing by ID
  let listing = await Listing.findById(id);

  // If not found → handle error
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  // Modify image URL to resize using Cloudinary transformation
  let originalImageUrl = listing.image.url;

  // Add height & width transformation
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_350");

  // Render edit page with listing data
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};


// =======================
// UPDATE LISTING
// =======================

module.exports.updateRouter = async (req, res) => {
  let { id } = req.params;

  // Update listing with new form data
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // If new image uploaded → update image
  if (req.file) {

    let url = req.file.path;
    let filename = req.file.filename;

    // Replace old image
    listing.image = { filename, url };

    // Save updated image
    await listing.save();
  }

  req.flash("success", "Listing updated");

  // Redirect to updated listing page
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect(`/listings/${id}`);
  });
};


// =======================
// DELETE LISTING
// =======================

module.exports.destroyRoute = async (req, res) => {
  let { id } = req.params;

  // Delete listing from DB
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);

  req.flash("success", "Listing deleted");

  // Redirect to all listings
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
};


// =======================
// SHOW SINGLE LISTING
// =======================

module.exports.renderShowRoute = async (req, res) => {
  let { id } = req.params;

  // Find listing and populate related data
  let listing = await Listing.findById(id)

    // Populate reviews and their authors
    .populate({ path: "review", populate: { path: "author" } })

    // Populate owner details
    .populate("owner");

  // If listing not found
  if (!listing) {
    req.flash("error", "Listing you requested do not exist");
    return res.redirect("/listings");
  }

  // Render show page
  res.render("listings/show.ejs", { listing });
};