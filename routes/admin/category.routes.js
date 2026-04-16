const router = require("express").Router();
const categoryController = require("../../controller/admin/category.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /categories
 * @desc    Get Category Page
 */
router.get("/categories", adminMiddleware.adminRoute, categoryController.getCategories);

/**
 * @route   POST /categories/check
 * @desc    Fetch Categories
 */
router.post("/categories/check", adminMiddleware.adminRoute, categoryController.checkCategoryExists);

/**
 * @route   GET /categories/new
 * @desc    Render Add Category Page
 */
router.get("/categories/new", adminMiddleware.adminRoute, categoryController.getAddCategoryPage);

/**
 * @route   POST /admin/categories
 * @desc    Add New Category
 */
router.post("/categories", adminMiddleware.adminRoute, categoryController.createCategory);

/**
 * @route   GET /admin/categories/:id
 * @desc    Delete Category
 */
router.delete("/categories/:id", adminMiddleware.adminRoute, categoryController.deleteCategory);

/**
 * @route   POST /admin/categories/:id/status
 * @desc    Activate/Deactivate Category
 */
router.patch("/categories/:id/status", categoryController.toggleCategoryStatus);

module.exports = router;