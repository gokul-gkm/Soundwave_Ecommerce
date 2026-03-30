const router = require("express").Router();
const userController = require("../../controller/users/userControlller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /
 * @desc    Render Home Page
 */
router.get("/", userMiddleware.userbloack, userController.home);

/**
 * @route   GET /login
 * @desc    Render Login Page
 */
router.get("/login", userMiddleware.loginTrue, userController.signUp);

/**
 * @route   POST /sign-in
 * @desc    Handle User Login
 */
router.post("/sign-in", userController.getLogin);

/**
 * @route   POST /sign-up
 * @desc    Handle User Signup
 */
router.post("/sign-up", userController.signupPost);

/**
 * @route   POST /login
 * @desc    Check Email Exists
 */
router.post("/login", userController.emailExist);

/**
 * @route   POST /logout
 * @desc    Logout User
 */
router.post("/logout", userController.logout);

module.exports = router;