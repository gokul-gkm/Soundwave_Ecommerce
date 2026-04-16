const Review = require("../../models/reviews");
const Product = require("../../models/products");

/**
 * @desc    Submit Product Review
 * @route   POST /reviews/:proId
 */
const createReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.session.login;

    const product = await Product.findOne({ _id: req.params.proId });

    const newReview = await Review.create({
      reviews: review,
      ratings: rating,
      userId,
      productId: product._id,
    });

    if (newReview) {
      res.redirect("/order");
    } else {
      res.status(404).send("review not added");
    }
  } catch (err) {
    console.log(err.message + " reviews post");
  }
};

module.exports = { createReview };