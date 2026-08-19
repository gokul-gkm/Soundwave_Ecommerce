const router = require("express").Router();
const addressController = require("../../controller/users/address.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /address
 * @desc    Get User Address Page
 */
router.get("/address", userMiddleware.userbloack, userMiddleware.user, addressController.getAddressPage);

/**
 * @route   POST /address
 * @desc    Add New Address
 */
router.post("/address", addressController.addAddress);

/**
 * @route   PATCH /address
 * @desc    Check Address Exists
 */
router.patch("/address", addressController.checkAddressExists);

/**
 * @route   DELETE /address
 * @desc    Delete Address
 */
router.delete("/address", addressController.deleteAddress);

/**
 * @route   PATCH /address/default
 * @desc    Set Default Address
 */
router.patch("/address/default", addressController.setDefaultAddress);

module.exports = router;