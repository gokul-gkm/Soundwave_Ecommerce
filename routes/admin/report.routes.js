const router = require("express").Router();
const reportController = require("../../controller/admin/adminReportController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /report/:id
 * @desc    Generate Sales Report
 */
router.get("/report/:id", adminMiddleware.adminRoute, reportController.report);

/**
 * @route   POST /report/download/:id
 * @desc    Download Report
 */
router.post("/report/download/:id", reportController.reportdownload);

/**
 * @route   PUT /report
 * @desc    Custom Report Generation
 */
router.put("/report", reportController.customreport);

module.exports = router;