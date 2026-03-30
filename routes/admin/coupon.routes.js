const router = require("express").Router();
const couponController = require("../../controller/admin/adminCoupenController");
const adminMiddleware = require("../../middleware/adminMiddleware");
const multer = require("multer");
const { storage } = require("../../config/cloudinary");

const upload = multer({ storage });

/**
 * @route   GET /coupon
 * @desc    Get Coupon Page
 */
router.get("/coupen", adminMiddleware.adminRoute, couponController.coupenPage);

/**
 * @route   POST /coupon
 * @desc    Add Coupon
 */
router.post("/coupen", upload.array("images"), couponController.addCoupen);

/**
 * @route   DELETE /coupon/:id
 * @desc    Delete Coupon
 */
router.delete("/coupenRemove/:id", couponController.coupenRemove);

/**
 * @route   POST /coupon/:id
 * @desc    Edit Coupon
 */
router.post("/coupenEdit/:id", upload.array("images"), couponController.coupenEdit);

module.exports = router;