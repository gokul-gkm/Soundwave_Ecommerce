const router = require("express").Router();
const chartController = require("../../controller/admin/chart.controller");

/**
 * @route   PUT /year
 * @desc    Get Yearly Chart Data
 */
router.put("/year", chartController.year);

/**
 * @route   PUT /monthly
 * @desc    Get Monthly Chart Data
 */
router.put("/monthly", chartController.monthlySales);

module.exports = router;