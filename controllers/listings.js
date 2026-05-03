const Listing = require("../models/listings");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); 

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  //console.log(allListings);
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewRoute = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createRouter = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
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

  let url = req.file.path;
  let filename = req.file.filename;
  let data = req.body.listing;

  let newListing = new Listing(data);
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;

  let newUpdatedListing = await newListing.save();
  console.log(newUpdatedListing);

  req.flash("success", "New Listing Created");
  
  // Redirect to listings page
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
};

module.exports.renderEditRouter = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_350"); 

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateRouter = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { filename, url };
    await listing.save();
  }

  req.flash("success", "Listing updated");

  // Redirect to updated listing page
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect(`/listings/${id}`);
  });
};

module.exports.destroyRoute = async (req, res) => {
  let { id } = req.params;

  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);

  req.flash("success", "Listing deleted");
  
  // Redirect to all listings
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
};

module.exports.renderShowRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "review", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};
