const Listing = require("../models/listings");
const Review = require("../models/reviews");

module.exports.reviewRenderShow = async (req, res) => {
  res.render("listings/show.ejs");
};

module.exports.createReview = async (req, res) => {
  console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;

  await listing.review.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review saved");

  req.flash("success", "New review saved");
  res.redirect(`/listings/${listing.id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  console.log(id, reviewId);

  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Reveiw deleted");
  res.redirect(`/listings/${id}`);
};
