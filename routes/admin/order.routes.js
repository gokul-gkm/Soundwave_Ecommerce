const router = require("express").Router();
const orderController = require("../../controller/admin/adminOrderController");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /orders
 * @desc    Get All Orders
 */
router.get("/orders", adminMiddleware.adminRoute, orderController.order);

/**
 * @route   PUT /orderStatus
 * @desc    Update Order Status
 */
router.put("/orderStatus", orderController.orderProstatus);

/**
 * @route   PUT /removeorder
 * @desc    Remove Product from Order
 */
router.put("/removeorder", orderController.removeorder);

/**
 * @route   PATCH /removeorder
 * @desc    Remove Entire Order
 */
router.patch("/removeorder", orderController.removeordeFull);

/**
 * @route   GET /ordersView/:id
 * @desc    Get Order Details
 */
router.get("/ordersView/:id", adminMiddleware.adminRoute, orderController.orderView);

/**
 * @route   POST /returnManage
 * @desc    Manage Return Requests
 */
router.post("/returnManage", orderController.returnManaging);

module.exports = router;