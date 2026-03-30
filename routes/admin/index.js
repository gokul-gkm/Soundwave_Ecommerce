const router = require("express").Router();

/**
 * ================= ADMIN ROUTES =================
 */

router.use("/", require("./dashboard.routes"));
router.use("/", require("./user.routes"));
router.use("/", require("./category.routes"));
router.use("/", require("./product.routes"));
router.use("/", require("./order.routes"));
router.use("/", require("./coupon.routes"));
router.use("/", require("./offer.routes"));
router.use("/", require("./report.routes"));
router.use("/", require("./chart.routes"));

module.exports = router;