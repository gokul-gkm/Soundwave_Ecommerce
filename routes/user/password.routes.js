const router = require("express").Router();
const passwordController = require("../../controller/users/password.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /forget-password
 * @desc    Render Forgot Password Page
 */
router.get("/forget-password", userMiddleware.loginTrue, passwordController.renderForgetPasswordPage);

/**
 * @route   POST /forget-email-exists
 * @desc    Verify Email for Password Reset
 */
router.post("/forget-email-exists", passwordController.forgetEmailExist);

/**
 * @route   POST /forget-password
 * @desc    Process Password Reset Request (OTP Flow)
 */
router.post("/forget-password", passwordController.forgetPassword);

/**
 * @route   GET /reset-password
 * @desc    Render Reset Password Page
 */
router.get("/reset-password", passwordController.renderNewPasswordPage);

/** 
 * @route   POST /newPass
 * @desc    Update User Password
 */
router.post("/newPass", passwordController.updatePassword);

module.exports = router;