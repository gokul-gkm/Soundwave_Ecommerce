const router = require("express").Router();
const adminUserController = require("../../controller/admin/adminUserController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /users
 * @desc    Get All Users
 */
router.get("/users", adminMiddleware.adminRoute, adminUserController.users);

/**
 * @route   GET /userRemove
 * @desc    Remove User
 */
router.get("/userRemove", adminMiddleware.adminRoute, adminUserController.userRemove);

/**
 * @route   POST /user
 * @desc    Block/Unblock User
 */
router.post("/user", adminUserController.userBlock);

module.exports = router;