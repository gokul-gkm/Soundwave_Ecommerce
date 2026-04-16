const router = require("express").Router();
const productController = require("../../controller/admin/product.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");
const multer = require("multer");
const { storage } = require("../../config/cloudinary");

const upload = multer({ storage });

/**
 * @route   GET /products
 * @desc    Get Product List
 */
router.get("/products", adminMiddleware.adminRoute, productController.getProducts);

/**
 * @route   GET /products/new
 * @desc    Render Add Product Page
 */
router.get("/products/new", adminMiddleware.adminRoute, productController.getCreateProductPage);




/**
 * @route   POST /products
 * @desc    Add New Product
 */
router.post("/products", upload.array("images", 3), productController.createProduct);

/**
 * @route   POST /products/:id
 * @desc    Edit Product
 */
router.post(
  "/products/:id",
  upload.fields([
    { name: "images0", maxCount: 1 },
    { name: "images1", maxCount: 1 },
    { name: "images2", maxCount: 1 },
  ]),
  productController.updateProduct
);

/**
 * @route   DELETE /products/:id
 * @desc    Delete Product
 */
router.delete("/products/:id", productController.deleteProduct);

/**
 * @route   POST /products/:id/status
 * @desc    Toggle Product Listing
 */
router.post("/products/:id/status", productController.toggleProductStatus);

module.exports = router;