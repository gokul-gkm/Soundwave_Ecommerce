const router = require("express").Router();
const userController = require("../../controller/users/userControlller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /profile
 * @desc    Get User Profile Page
 */
router.get("/profile", userMiddleware.userbloack, userMiddleware.user, userController.profile);

/**
 * @route   POST /editProfile
 * @desc    Update User Profile Information
 */
router.post("/editProfile", userController.editProfile);

module.exports = router;