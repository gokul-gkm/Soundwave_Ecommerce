const router = require("express").Router();
const productController = require("../../controller/users/product.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /products
 * @desc    Get All Products
 */
router.get("/products", userMiddleware.userbloack, productController.getProducts);

/**
 * @route   GET /category
 * @desc    Get Products by Category
 */
router.get("/category", userMiddleware.userbloack, productController.getProductsByCategory);

/**
 * @route   GET /product/:id
 * @desc    Get Product Details
 */
router.get("/product/:id", userMiddleware.userbloack, productController.getProductDetails);

/**
 * @route   POST /products/filter
 * @desc    Filter Products
 */
router.post("/products/filter", productController.filterProducts);

module.exports = router;