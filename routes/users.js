const express = require("express");
const router = express.Router();
const userController = require("../controller/users/userController");
const userAddressController = require("../controller/users/userAddressController");
const userCartController = require("../controller/users/userCartController");
const userOrderController = require("../controller/users/userOrderController");
const userCoupenController = require("../controller/users/userCoupenController");
const userWishlistController = require("../controller/users/userWishlistController");
const userProductController = require("../controller/users/userProductController");
const userMidleware = require("../middleware/userMiddleware");
const { check, validationResult } = require("express-validator");
// const { validateSignup, checkValidation } = require('../middleware/validation.js');

// get home page
router.get("/", userMidleware.userbloack, userController.home);

//login page rendering
router.get("/login", userMidleware.loginTrue, userController.signUp);

//about page rendering
router.get("/about", userController.about);

//email exist checking
router.post("/login", userController.emailExist);

// signup post
router.post("/sign-up", userController.signupPost);

//otp get
router.get("/otp", userMidleware.loginTrue, userController.otp);

//resend the otp
router.get("/resend", userController.resend);

//otp post
router.post("/otp", userController.gettingOtp);

//resubmit the email in otp
router.post("/resubmit", userController.resubmit);

// login post
router.post("/sign-in", userController.getLogin);

/********************* Password ***********************/

//forget-password
router.get("/forget-password", userMidleware.loginTrue, userController.forgetPassword);

//forgetpass fetching
router.post("/forgetPass", userController.forgetemailExist);

//forget redirecting to otp
router.post("/forget", userController.forget);

// enter the new password and upadating
router.get("/reset-password", userController.newPass);

// get new pass
router.post("/newPass", userController.getNewPass);



/********************* Products ***********************/

//products route
router.get("/products", userMidleware.userbloack, userProductController.products);

//category route
router.get("/category", userMidleware.userbloack, userProductController.category);

//profile route
router.get("/product", userMidleware.userbloack, userProductController.productDetails);

//filter products
router.post('/filter-products', userProductController.filterProducts);

/********************* Profile ***********************/

//profile route
router.get("/profile", userMidleware.userbloack, userMidleware.user, userController.profile);

//Edit profile post
router.post("/profile", userController.editProfile);


/********************* Cart  ***********************/

//cart rendering route
router.get("/cart", userMidleware.userbloack, userMidleware.user, userCartController.cart);

// add cart fetching
router.put("/cart", userCartController.addcart);

//add cart on post requuser
router.post("/cart", userCartController.addcartPost);

//cart stock increasing fetching
router.put("/cart-update", userCartController.cartEdit);

//deleate cart
router.delete("/cart", userCartController.cartRemove);

/********************* wishlist ***********************/

//wishlist page rendering route
router.get("/wishlist", userMidleware.userbloack, userMidleware.user, userWishlistController.wishlist);

//add to wishlist post
router.post("/wishlist", userWishlistController.addToWishlist);

//remove from wishlist
router.delete("/wishlist", userWishlistController.wishlistRemove);

/***************Address***************/

//address route
router.get("/address", userMidleware.userbloack, userMidleware.user, userAddressController.address);

// getting addresss
router.post("/address", userAddressController.getaddress);

//fetching address exists or note
router.put("/address", userAddressController.patchaddress);

//remove address
router.delete("/address", userAddressController.removeaddress);

// defulat address fetching
router.put("/Defaddress", userAddressController.Defaddress);

/***************Order***************/

router.get("/checkout", userMidleware.userbloack, userMidleware.user, userOrderController.checkoutPage);

//  order det page rendering
router.get("/order", userMidleware.userbloack, userMidleware.user, userOrderController.orderDetails);

//  order det page rendering
router.get("/orders/:id", userMidleware.userbloack, userMidleware.user, userOrderController.orderView);

//order canceling
router.put("/orders/cancel", userOrderController.cancelOrder);

//  returnOrder (post)
router.put('/orders/return', userOrderController.returnOrder);

// succes msg rendering
router.get("/orders/success", userMidleware.userbloack, userMidleware.user, userOrderController.success);

//succes post route
router.post("/orders", userOrderController.postSucces);

//razorpay
router.post("/payments/razorpay", userOrderController.razor);

router.get("/wallet", userMidleware.userbloack, userMidleware.user, userOrderController.walletHistory);

//invoice download
router.get("/invoice/:id", userOrderController.invoice);

//review
router.post("/reviews/:proId", userOrderController.reviewPost);

router.post("/payments/failure", userOrderController.razorFailure)

router.post('/payments/retry', userOrderController.failedPaymentRetry)

router.post('/payments/retry-status',userOrderController.changeStatusRetry)

/*****************Coupens***************** */

//  order det page rendering
router.get("/coupons", userMidleware.userbloack, userMidleware.user, userCoupenController.coupenView);

//coupon code posting
router.post("/coupons/apply", userCoupenController.coupenCode);

//logout
router.post("/logout", userController.logout);



//catch all
router.get('/404',userController.catchAll)

module.exports = router;
