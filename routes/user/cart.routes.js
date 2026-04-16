const router = require("express").Router();
const cartController = require("../../controller/users/cart.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /cart
 * @desc    Get User Cart Page
 */
router.get("/cart", userMiddleware.userbloack, userMiddleware.user, cartController.renderCartPage);

/**
 * @route   PUT /cart
 * @desc    Add Item to Cart (API)
 */
router.put("/cart", cartController.addToCart);

/**
 * @route   POST /cart
 * @desc    Add Item to Cart (Form Submission)
 */
router.post("/cart", cartController.addToCartFromForm);

/**
 * @route   PUT /cart-update
 * @desc    Update Cart Item Quantity
 */
router.put("/cart-update", cartController.updateCartItem);

/**
 * @route   DELETE /cart
 * @desc    Remove Item from Cart
 */
router.delete("/cart", cartController.removeCartItem);

module.exports = router;