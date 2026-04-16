const router = require("express").Router();
const otpController = require('../../controller/users/otp.controller');
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /otp
 * @desc    Render OTP Verification Page
 */
router.get("/otp", userMiddleware.loginTrue, otpController.renderOtpPage);

/**
 * @route   GET /resend
 * @desc    Resend OTP to User Email
 */
router.get("/resend", otpController.resendOtp);

/**
 * @route   POST /otp
 * @desc    Verify Submitted OTP
 */
router.post("/otp", otpController.verifyOtp);

/**
 * @route   POST /resubmit
 * @desc    Resubmit Email for OTP Verification
 */
router.post("/resubmit", otpController.resubmitEmail);

module.exports = router;