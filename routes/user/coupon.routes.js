const router = require("express").Router();
const couponController = require("../../controller/users/coupon.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /coupon
 * @desc    Get Available Coupons Page
 */
router.get("/coupon", userMiddleware.userbloack, userMiddleware.user, couponController.getCouponsPage);

/**
 * @route   POST /coupons/apply
 * @desc    Apply Coupon Code
 */
router.post("/coupons/apply", couponController.applyCoupon);

module.exports = router;