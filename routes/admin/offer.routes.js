const router = require("express").Router();
const offerController = require("../../controller/admin/offer.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /offers
 * @desc    Get Offer Page
 */
router.get("/offers", adminMiddleware.adminRoute, offerController.getOffers);

/**
 * @route   GET /offers/new
 * @desc    Render Add Offer Page
 */
router.get("/offers/new", adminMiddleware.adminRoute, offerController.getCreateOfferPage);

/**
 * @route   POST /offers
 * @desc    Create Offer
 */
router.post("/offers", offerController.createOffer);

/**
 * @route   PUT /offer/:id
 * @desc    Add Product to Offer
 */
router.put("/offers/:id/products", offerController.toggleProductOffer);

/**
 * @route   PUT /offers/:catId/categories
 * @desc    Add Category to Offer
 */
router.put("/offers/:catId/categories", offerController.toggleCategoryOffer);

/**
 * @route   GET /offers/:id/products
 * @desc    Get Offer Products
 */
router.get("/offers/:id/products", adminMiddleware.adminRoute, offerController.getOfferProducts);

/**
 * @route   GET /offers/:id/categories
 * @desc    Get Offer Categories
 */
router.get("/offers/:id/categories", adminMiddleware.adminRoute, offerController.getOfferCategory);

/**
 * @route   GET /offers/:id/edit
 * @desc    Render Edit Offer Page
 */
router.get("/offers/:id/edit", adminMiddleware.adminRoute, offerController.getEditOfferPage);

/**
 * @route   POST /offers/edit/:id
 * @desc    Update Offer
 */
router.post("/offers/edit/:id", adminMiddleware.adminRoute, offerController.updateOffer);

/**
 * @route   GET /offers/remove/:id
 * @desc    Delete Offer
 */
router.get("/offers/remove/:id", adminMiddleware.adminRoute, offerController.deleteOffer);

module.exports = router;