const router = require("express").Router();
const categoryController = require("../../controller/admin/adminCategoryController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /category
 * @desc    Get Category Page
 */
router.get("/catagory", adminMiddleware.adminRoute, categoryController.category);

/**
 * @route   POST /categoryFetch
 * @desc    Fetch Categories
 */
router.post("/categoryFetch", adminMiddleware.adminRoute, categoryController.categoryFetch);

/**
 * @route   GET /categoryAdd
 * @desc    Render Add Category Page
 */
router.get("/catagoryAdd", adminMiddleware.adminRoute, categoryController.catgoryAdd);

/**
 * @route   POST /categoryAdd
 * @desc    Add New Category
 */
router.post("/catgoryAdd", adminMiddleware.adminRoute, categoryController.getcatgoryAdd);

/**
 * @route   GET /categoryRemove
 * @desc    Delete Category
 */
router.get("/Catremove", adminMiddleware.adminRoute, categoryController.categorydlt);

/**
 * @route   POST /categoryStatus
 * @desc    Activate/Deactivate Category
 */
router.post("/activeOrnot", categoryController.catgoryActive);

module.exports = router;