const router = require("express").Router();
const reportController = require("../../controller/admin/report.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /report/:id
 * @desc    Generate Sales Report
 */
router.get("/report/:id", adminMiddleware.adminRoute, reportController.getReportByType);

/**
 * @route   POST /report/download/:id
 * @desc    Download Report
 */
router.post("/report/download/:id", reportController.downloadReport);

/**
 * @route   PUT /report
 * @desc    Custom Report Generation
 */
router.put("/report", reportController.getCustomReport);

module.exports = router;