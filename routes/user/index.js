const router = require("express").Router();
const userController = require("../../controller/users/userControlller");

/**
 * ================= USER ROUTES =================
 */

router.use("/", require("./auth.routes"));
router.use("/", require("./otp.routes"));
router.use("/", require("./password.routes"));
router.use("/", require("./product.routes"));
router.use("/", require("./profile.routes"));
router.use("/", require("./cart.routes"));
router.use("/", require("./wishlist.routes"));
router.use("/", require("./address.routes"));
router.use("/", require("./order.routes"));
router.use("/", require("./coupon.routes"));



/**
 * @route   GET /about
 * @desc    Render About Page
 */
router.get("/about", userController.about);

/**
 * @route   GET /404
 * @desc    Render 404 Page
 */
router.get("/404", userController.catchAll);

module.exports = router;