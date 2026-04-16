const router = require("express").Router();
const userMiddleware = require("../../middleware/userMiddleware");
const authController = require("../../controller/users/auth.controller");
const pageController = require("../../controller/users/page.controller");

/**
 * @route   GET /
 * @desc    Render Home Page
 */
router.get("/", userMiddleware.userbloack, pageController.renderHomePage);

/**
 * @route   GET /login
 * @desc    Render Login Page
 */
router.get("/login", userMiddleware.loginTrue, authController.renderAuthPage);

/**
 * @route   POST /sign-in
 * @desc    Handle User Login
 */
router.post("/sign-in", authController.loginUser);

/**
 * @route   POST /sign-up
 * @desc    Handle User Signup
 */
router.post("/sign-up", authController.registerUser);

/**
 * @route   POST /check-email
 * @desc    Check Email Exists
 */
router.post("/check-email", authController.emailExist);

/**
 * @route   POST /logout
 * @desc    Logout User
 */
router.post("/logout", authController.logoutUser);

module.exports = router;