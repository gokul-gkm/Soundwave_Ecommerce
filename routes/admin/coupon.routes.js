const router = require("express").Router();
const couponController = require("../../controller/admin/coupon.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");
const multer = require("multer");
const { storage } = require("../../config/cloudinary");

const upload = multer({ storage });

/**
 * @route   GET /coupons
 * @desc    Get Coupon Page
 */
router.get("/coupons", adminMiddleware.adminRoute, couponController.getCouponsPage);

/**
 * @route   POST /coupons
 * @desc    Add Coupon
 */
router.post("/coupons", upload.array("images"), couponController.createCoupon);

/**
 * @route   DELETE /coupons/:id
 * @desc    Delete Coupon
 */
router.delete("/coupons/:id", couponController.deleteCoupon);

/**
 * @route   POST /coupons/:id
 * @desc    Edit Coupon
 */
router.post("/coupons/:id", upload.array("images"), couponController.updateCoupon);

module.exports = router;