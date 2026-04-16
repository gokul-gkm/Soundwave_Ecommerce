const router = require("express").Router();
const orderController = require("../../controller/admin/order.controller");
const adminMiddleware = require("../../middleware/adminMiddleware");

/**
 * @route   GET /orders
 * @desc    Get All Orders
 */
router.get("/orders", adminMiddleware.adminRoute, orderController.getOrders);

/**
 * @route   GET /orders/:id
 * @desc    Get Order Details
 */
router.get("/orders/:id", adminMiddleware.adminRoute, orderController.getOrderById);


/**
 * @route   PATCH /orders/:orderId/items/:productId
 * @desc    Update Order Status
 */
router.patch("/orders/:orderId/items/:productId", orderController.updateOrderItemStatus);

/**
 * @route   PUT /orders/:orderId/items/:productId
 * @desc    Remove Product from Order
 */
router.delete("/orders/:orderId/items/:productId", orderController.removeOrderItem);

/**
 * @route   PATCH /orders/:orderId
 * @desc    Remove Entire Order
 */
router.delete("/orders/:orderId", orderController.deleteOrder);


/**
 * @route   POST /orders/:orderId/returns
 * @desc    Manage Return Requests
 */
router.post("/orders/:orderId/returns", orderController.handleReturnRequest);

module.exports = router;