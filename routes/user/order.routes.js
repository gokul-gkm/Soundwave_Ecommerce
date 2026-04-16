const router = require("express").Router();
const orderController = require("../../controller/users/order.controller");
const walletController = require("../../controller/users/wallet.controller");
const reviewController = require("../../controller/users/review.controller");
const paymentController = require("../../controller/users/payment.controller");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /checkout
 * @desc    Render Checkout Page
 */
router.get("/checkout", userMiddleware.userbloack, userMiddleware.user, orderController.getCheckoutPage);

/**
 * @route   GET /orders
 * @desc    Get User Orders
 */
router.get("/orders", userMiddleware.userbloack, userMiddleware.user, orderController.getOrders);

/**
 * @route   PUT /orders/cancel
 * @desc    Cancel Order
 */
router.put("/orders/cancel", orderController.cancelOrderItem);

/**
 * @route   PUT /orders/return
 * @desc    Return Order
 */
router.put("/orders/return", orderController.returnOrderItem);

/**
 * @route   GET /orders/success
 * @desc    Render Order Success Page
 */
router.get("/orders/success", userMiddleware.userbloack, userMiddleware.user, orderController.getOrderSuccessPage);

/**
 * @route   POST /orders
 * @desc    Handle Successful Order Placement
 */
router.post("/orders", orderController.createOrder);

/**
 * @route   GET /orders/:id
 * @desc    Get Order Details by ID
 */
router.get("/orders/:id", userMiddleware.userbloack, userMiddleware.user, orderController.getOrderById);

/**
 * @route   POST /payments/razorpay
 * @desc    Handle Razorpay Payment
 */
router.post("/payments/razorpay", paymentController.createRazorpayOrder);

/**
 * @route   POST /payments/failure
 * @desc    Handle Payment Failure
 */
router.post("/payments/failure", paymentController.handlePaymentFailure);

/**
 * @route   POST /payments/retry
 * @desc    Retry Failed Payment
 */
router.post("/payments/retry", paymentController.retryPayment);

/**
 * @route   POST /payments/retry-status
 * @desc    Update Order Status After Retry
 */
router.post("/payments/retry-status", paymentController.updateRetryStatus);

/**
 * @route   GET /wallet
 * @desc    Get User Wallet History
 */
router.get("/wallet", userMiddleware.userbloack, userMiddleware.user, walletController.getWalletHistory);

/**
 * @route   GET /invoice/:id
 * @desc    Download Invoice by Order ID
 */
router.get("/invoice/:id", orderController.downloadInvoice);

/**
 * @route   POST /reviews/:proId
 * @desc    Submit Product Review
 */
router.post("/reviews/:proId", reviewController.createReview);

module.exports = router;