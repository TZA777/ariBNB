// =======================
// IMPORT MODELS
// =======================

// Listing model → used to access listings collection
const Listing = require("../models/listings");

// Review model → used to create/delete reviews
const Review = require("../models/reviews");


// =======================
// RENDER SHOW PAGE (REVIEWS)
// =======================

module.exports.reviewRenderShow = async (req, res) => {
  // Simply renders the listing show page
  // ⚠️ Note: No data is being fetched here
  // Usually, listing data should be passed (already handled in listing controller)

  res.render("listings/show.ejs");
};


// =======================
// CREATE REVIEW
// =======================

module.exports.createReview = async (req, res) => {

  // Get listing ID from URL params
  console.log(req.params.id);

  // Find the listing to which review belongs
  let listing = await Listing.findById(req.params.id);

  // Create new review using form data
  let newReview = new Review(req.body.review);

  // Assign current logged-in user as author
  newReview.author = req.user._id;

  // Add review reference to listing (array of reviews)
  await listing.review.push(newReview);

  // Save review in reviews collection
  await newReview.save();

  // Save updated listing (with review reference)
  await listing.save();

  console.log("new review saved");

  // Flash success message
  req.flash("success", "New review saved");

  // Redirect back to listing show page
  res.redirect(`/listings/${listing.id}`);
};


// =======================
// DELETE REVIEW
// =======================

module.exports.destroyReview = async (req, res) => {

  // Extract listing ID and review ID from params
  let { id, reviewId } = req.params;

  console.log(id, reviewId);

  // Remove review reference from listing
  // $pull → removes matching value from array
  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });

  // Delete review document from DB
  await Review.findByIdAndDelete(reviewId);

  // Flash success message
  req.flash("success", "Reveiw deleted");

  // Redirect back to listing page
  res.redirect(`/listings/${id}`);
};