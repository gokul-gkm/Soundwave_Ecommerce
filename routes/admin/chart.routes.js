const router = require("express").Router();
const chartController = require("../../controller/admin/chart.controller");

/**
 * @route   PATCH /year
 * @desc    Get Yearly Chart Data
 */
router.patch("/year", chartController.year);

/**
 * @route   PATCH /monthly
 * @desc    Get Monthly Chart Data
 */
router.patch("/monthly", chartController.monthlySales);

module.exports = router;