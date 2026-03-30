const router = require("express").Router();
const couponController = require("../../controller/users/userCoupenController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /coupen
 * @desc    Get Available Coupons Page
 */
router.get("/coupen", userMiddleware.userbloack, userMiddleware.user, couponController.coupenView);

/**
 * @route   POST /coupenCode/:id
 * @desc    Apply Coupon Code
 */
router.post("/coupenCode/:id", couponController.coupenCode);

module.exports = router;