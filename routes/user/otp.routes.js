const router = require("express").Router();
const userController = require("../../controller/users/userController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /otp
 * @desc    Render OTP Verification Page
 */
router.get("/otp", userMiddleware.loginTrue, userController.otp);

/**
 * @route   GET /resend
 * @desc    Resend OTP to User Email
 */
router.get("/resend", userController.resend);

/**
 * @route   POST /otp
 * @desc    Verify Submitted OTP
 */
router.post("/otp", userController.gettingOtp);

/**
 * @route   POST /resubmit
 * @desc    Resubmit Email for OTP Verification
 */
router.post("/resubmit", userController.resubmit);

module.exports = router;