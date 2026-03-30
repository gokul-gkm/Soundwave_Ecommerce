const router = require("express").Router();
const wishlistController = require("../../controller/users/userWishlistController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /wishlist
 * @desc    Get User Wishlist Page
 */
router.get("/wishlist", userMiddleware.userbloack, userMiddleware.user, wishlistController.wishlist);

/**
 * @route   POST /addToWishList
 * @desc    Add Product to Wishlist
 */
router.post("/addToWishList", wishlistController.addToWishlist);

/**
 * @route   DELETE /wishlistremove
 * @desc    Remove Product from Wishlist
 */
router.delete("/wishlistremove", wishlistController.wishlistRemove);

module.exports = router;