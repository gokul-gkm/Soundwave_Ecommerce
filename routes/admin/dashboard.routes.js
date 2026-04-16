const router = require("express").Router();
const adminController = require("../../controller/admin/admin.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /
 * @desc    Render Admin Dashboard
 */
router.get("/", adminMiddleware.adminRoute, adminController.getDashboard);

/**
 * @route   PUT /payments/summary
 * @desc    Fetch Payment Data
 */
router.put("/payments/summary", adminController.getPaymentSummary);

module.exports = router;