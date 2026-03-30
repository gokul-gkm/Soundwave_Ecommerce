const router = require("express").Router();
const addressController = require("../../controller/users/userAddressController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /address
 * @desc    Get User Address Page
 */
router.get("/address", userMiddleware.userbloack, userMiddleware.user, addressController.address);

/**
 * @route   POST /address
 * @desc    Add New Address
 */
router.post("/address", addressController.getaddress);

/**
 * @route   PUT /address
 * @desc    Update Existing Address
 */
router.put("/address", addressController.patchaddress);

/**
 * @route   DELETE /address
 * @desc    Delete Address
 */
router.delete("/address", addressController.removeaddress);

/**
 * @route   PUT /Defaddress
 * @desc    Set Default Address
 */
router.put("/Defaddress", addressController.Defaddress);

module.exports = router;