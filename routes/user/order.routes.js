const router = require("express").Router();
const orderController = require("../../controller/users/userOrderController");
const userMiddleware = require("../../middleware/userMiddleware");

/**
 * @route   GET /checkoutPage
 * @desc    Render Checkout Page
 */
router.get("/checkoutPage", userMiddleware.userbloack, userMiddleware.user, orderController.checkoutPage);

/**
 * @route   GET /order
 * @desc    Get User Orders
 */
router.get("/order", userMiddleware.userbloack, userMiddleware.user, orderController.orderDetails);

/**
 * @route   GET /orderView/:id
 * @desc    Get Order Details by ID
 */
router.get("/orderView/:id", userMiddleware.userbloack, userMiddleware.user, orderController.orderView);

/**
 * @route   PUT /editOrder
 * @desc    Cancel Order
 */
router.put("/editOrder", orderController.cancelOrder);

/**
 * @route   PUT /returnOrder
 * @desc    Return Order
 */
router.put("/returnOrder", orderController.returnOrder);

/**
 * @route   GET /success
 * @desc    Render Order Success Page
 */
router.get("/success", userMiddleware.userbloack, userMiddleware.user, orderController.success);

/**
 * @route   POST /success
 * @desc    Handle Successful Order Placement
 */
router.post("/success", orderController.postSucces);

/**
 * @route   POST /razor
 * @desc    Handle Razorpay Payment
 */
router.post("/razor", orderController.razor);

/**
 * @route   POST /failedpayment
 * @desc    Handle Payment Failure
 */
router.post("/failedpayment", orderController.razorFailure);

/**
 * @route   POST /failedPaymentRetry
 * @desc    Retry Failed Payment
 */
router.post("/failedPaymentRetry", orderController.failedPaymentRetry);

/**
 * @route   POST /changeStatusRetry
 * @desc    Update Order Status After Retry
 */
router.post("/changeStatusRetry", orderController.changeStatusRetry);

/**
 * @route   GET /walletHistory
 * @desc    Get User Wallet History
 */
router.get("/walletHistory", userMiddleware.userbloack, userMiddleware.user, orderController.walletHistory);

/**
 * @route   GET /invoice/:id
 * @desc    Download Invoice by Order ID
 */
router.get("/invoice/:id", orderController.invoice);

/**
 * @route   POST /submit-review/:proId
 * @desc    Submit Product Review
 */
router.post("/submit-review/:proId", orderController.reviewPost);

module.exports = router;