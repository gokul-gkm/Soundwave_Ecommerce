const router = require("express").Router();
const userController = require("../../controller/users/userController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /forgetPassword
 * @desc    Render Forgot Password Page
 */
router.get("/forgetPassword", userMiddleware.loginTrue, userController.forgetPassword);

/**
 * @route   POST /forgetPass
 * @desc    Verify Email for Password Reset
 */
router.post("/forgetPass", userController.forgetemailExist);

/**
 * @route   POST /forget
 * @desc    Process Password Reset Request (OTP Flow)
 */
router.post("/forget", userController.forget);

/**
 * @route   GET /newPass
 * @desc    Render New Password Page
 */
router.get("/newPass", userController.newPass);

/**
 * @route   POST /newPass
 * @desc    Update User Password
 */
router.post("/newPass", userController.getNewPass);

module.exports = router;