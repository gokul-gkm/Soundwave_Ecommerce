const router = require("express").Router();
const productController = require("../../controller/users/userProductController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /products
 * @desc    Get All Products
 */
router.get("/products", userMiddleware.userbloack, productController.products);

/**
 * @route   GET /category
 * @desc    Get Products by Category
 */
router.get("/category", userMiddleware.userbloack, productController.category);

/**
 * @route   GET /product/:id
 * @desc    Get Product Details
 */
router.get("/product", userMiddleware.userbloack, productController.productDetails);

/**
 * @route   POST /filter-products
 * @desc    Filter Products
 */
router.post("/filter-products", productController.filterProducts);

module.exports = router;