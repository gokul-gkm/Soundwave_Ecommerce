const router = require("express").Router();
const offerController = require("../../controller/admin/adminOfferController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /offer
 * @desc    Get Offer Page
 */
router.get("/offer", adminMiddleware.adminRoute, offerController.offerPage);

/**
 * @route   GET /addOffer
 * @desc    Render Add Offer Page
 */
router.get("/addOffer", adminMiddleware.adminRoute, offerController.addOfferPage);

/**
 * @route   POST /offer
 * @desc    Create Offer
 */
router.post("/offer", offerController.offerCreating);

/**
 * @route   PUT /offer/:id
 * @desc    Add Product to Offer
 */
router.put("/offer/:id", offerController.offerProductAdd);

/**
 * @route   PUT /offer/catOffer/:catId
 * @desc    Add Category to Offer
 */
router.put("/offer/catOffer/:catId", offerController.offerCategoryAdd);

/**
 * @route   GET /offerProduct/:id
 * @desc    Get Offer Products
 */
router.get("/offerProduct/:id", adminMiddleware.adminRoute, offerController.offerProduct);

/**
 * @route   GET /offerCategory/:id
 * @desc    Get Offer Categories
 */
router.get("/offerCategory/:id", adminMiddleware.adminRoute, offerController.offerCategory);

/**
 * @route   GET /offeredit/:id
 * @desc    Render Edit Offer Page
 */
router.get("/offeredit/:id", adminMiddleware.adminRoute, offerController.offerEdit);

/**
 * @route   POST /offeredit/:id
 * @desc    Update Offer
 */
router.post("/offeredit/:id", adminMiddleware.adminRoute, offerController.getOfferEdit);

/**
 * @route   GET /offerRemove/:id
 * @desc    Delete Offer
 */
router.get("/offerRemove/:id", adminMiddleware.adminRoute, offerController.offerRemove);

module.exports = router;