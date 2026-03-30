const router = require("express").Router();
const productController = require("../../controller/admin/adminProductController");
const adminMiddleware = require("../../middleware/adminMiddleware");
const multer = require("multer");
const { storage } = require("../../config/cloudinary");

const upload = multer({ storage });

/**
 * @route   GET /product
 * @desc    Get Product List
 */
router.get("/product", adminMiddleware.adminRoute, productController.productDetails);

/**
 * @route   GET /productAdd
 * @desc    Render Add Product Page
 */
router.get("/productAdd", adminMiddleware.adminRoute, productController.productAdd);

/**
 * @route   POST /productAdd
 * @desc    Add New Product
 */
router.post("/productAdd", upload.array("images", 3), productController.getproduct);

/**
 * @route   POST /edit
 * @desc    Edit Product
 */
router.post(
  "/edit",
  upload.fields([
    { name: "images0", maxCount: 1 },
    { name: "images1", maxCount: 1 },
    { name: "images2", maxCount: 1 },
  ]),
  productController.editProduct
);

/**
 * @route   GET /dltProduct
 * @desc    Delete Product
 */
router.get("/dltProduct", productController.dltPro);

/**
 * @route   POST /listedOrnot
 * @desc    Toggle Product Listing
 */
router.post("/listedOrnot", productController.productListed);

module.exports = router;