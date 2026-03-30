const router = require("express").Router();
const cartController = require("../../controller/users/userCartController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /cart
 * @desc    Get User Cart Page
 */
router.get("/cart", userMiddleware.userbloack, userMiddleware.user, cartController.cart);

/**
 * @route   PUT /addcart
 * @desc    Add Item to Cart (API)
 */
router.put("/addcart", cartController.addcart);

/**
 * @route   POST /addcart
 * @desc    Add Item to Cart (Form Submission)
 */
router.post("/addcart", cartController.addcartPost);

/**
 * @route   PUT /cartUpdate
 * @desc    Update Cart Item Quantity
 */
router.put("/cartUpdate", cartController.cartEdit);

/**
 * @route   DELETE /cartremove
 * @desc    Remove Item from Cart
 */
router.delete("/cartremove", cartController.cartRemove);

module.exports = router;