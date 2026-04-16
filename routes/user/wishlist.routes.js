const router = require("express").Router();
const wishlistController = require("../../controller/users/wishlist.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /wishlist
 * @desc    Get User Wishlist Page
 */
router.get("/wishlist", userMiddleware.userbloack, userMiddleware.user, wishlistController.getWishlistPage);

/**
 * @route   POST /wishlist
 * @desc    Add Product to Wishlist
 */
router.post("/wishlist", wishlistController.addToWishlist);

/**
 * @route   DELETE /wishlist
 * @desc    Remove Product from Wishlist
 */
router.delete("/wishlist", wishlistController.removeFromWishlist);

module.exports = router;