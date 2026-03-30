const router = require("express").Router();
const adminController = require("../../controller/admin/adminController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /
 * @desc    Render Admin Dashboard
 */
router.get("/", adminMiddleware.adminRoute, adminController.adminPage);

/**
 * @route   PUT /payment
 * @desc    Fetch Payment Data
 */
router.put("/peyment", adminController.peyment);

module.exports = router;