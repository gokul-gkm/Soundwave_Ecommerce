const router = require("express").Router();
const profileController = require("../../controller/users/profile.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /profile
 * @desc    Get User Profile Page
 */
router.get("/profile", userMiddleware.userbloack, userMiddleware.user, profileController.getProfile);

/**
 * @route   POST /editProfile
 * @desc    Update User Profile Information
 */
router.post("/editProfile", profileController.updateProfile);

module.exports = router;