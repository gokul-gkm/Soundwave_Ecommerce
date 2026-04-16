const router = require("express").Router();
const adminUserController = require("../../controller/admin/user.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /admin/users
 * @desc    Get All Users
 */
router.get("/users", adminMiddleware.adminRoute, adminUserController.getUsers);

/**
 * @route   GET /admin/users/:id
 * @desc    Remove User
 */
router.delete("/users/:id", adminMiddleware.adminRoute, adminUserController.deleteUser);

/**
 * @route   POST /admin/users/:id/block
 * @desc    Block/Unblock User
 */
router.post("/users/:id/block", adminUserController.toggleUserBlock);

module.exports = router;