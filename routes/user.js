const express = require("express");
const router = express.Router();
const userController = require("../controller/users/userControlller");
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

//forgetPassword
router.get("/forgetPassword", userMidleware.loginTrue, userController.forgetPassword);

//forgetpass fetching
router.post("/forgetPass", userController.forgetemailExist);

//forget redirecting to otp
router.post("/forget", userController.forget);

// enter the new password and upadating
router.get("/newPass", userController.newPass);

// get new pass
router.post("/newPass", userController.getNewPass);



/********************* Products ***********************/

//products route
router.get("/products", userMidleware.userbloack, userProductController.products);

//category route
router.get("/category", userMidleware.userbloack, userProductController.category);

//profile route
router.get("/productDets", userMidleware.userbloack, userProductController.productDets);

//filter products
router.post('/filter-products', userProductController.filterProducts);

/********************* Profile ***********************/

//profile route
router.get("/profile", userMidleware.userbloack, userMidleware.user, userController.profile);

//Edit profile post
router.post("/editProfile", userController.editProfile);


/********************* Cart  ***********************/

//cart rendering route
router.get("/cart", userMidleware.userbloack, userMidleware.user, userCartController.cart);

// add cart fetching
router.put("/addcart", userCartController.addcart);

//add cart on post requuser
router.post("/addcart", userCartController.addcartPost);

//cart stock increasing fetching
router.put("/cartUpdate", userCartController.cartEdit);

//deleate cart
router.delete("/cartremove", userCartController.cartRemove);

/********************* wishlist ***********************/

//wishlist page rendering route
router.get("/wishlist", userMidleware.userbloack, userMidleware.user, userWishlistController.wishlist);

//add to wishlist post
router.post("/addToWishList", userWishlistController.addToWishlist);

//remove from wishlist
router.delete("/wishlistremove", userWishlistController.wishlistRemove);

/***************Address***************/

//adress route
router.get("/adress", userMidleware.userbloack, userMidleware.user, userAddressController.adress);

// getting addresss
router.post("/adress", userAddressController.getadress);

//fetching adress exists or note
router.put("/address", userAddressController.patchaddress);

//remove address
router.delete("/address", userAddressController.removeadress);

// defulat address fetching
router.put("/Defaddress", userAddressController.Defaddress);

/***************Order***************/

router.get("/checkoutPage", userMidleware.userbloack, userMidleware.user, userOrderController.checkoutPage);

//  order det page rendering
router.get("/order", userMidleware.userbloack, userMidleware.user, userOrderController.orderDetails);

//  order det page rendering
router.get("/orderView/:id", userMidleware.userbloack, userMidleware.user, userOrderController.orderView);

//order canceling
router.put("/editOrder", userOrderController.cancelOrder);

//  returnOrder (post)
router.put('/returnOrder', userOrderController.returnOrder);

// succes msg rendering
router.get("/success", userMidleware.userbloack, userMidleware.user, userOrderController.success);

//succes post route
router.post("/success", userOrderController.postSucces);

//razorpay
router.post("/razor", userOrderController.razor);

router.get("/walletHistory", userMidleware.userbloack, userMidleware.user, userOrderController.walletHistory);

//invoice download
router.get("/invoice/:id", userOrderController.invoice);

//review
router.post("/submit-review/:proId", userOrderController.reviewPost);

router.post("/failedpayment", userOrderController.razorFailure)

router.post('/failedPaymentRetry', userOrderController.failedPaymentRetry)

router.post('/changeStatusRetry',userOrderController.changeStatusRetry)

/*****************Coupens***************** */

//  order det page rendering
router.get("/coupen", userMidleware.userbloack, userMidleware.user, userCoupenController.coupenView);

//coupen code posting
router.post("/coupenCode/:id", userCoupenController.coupenCode);

//logout
router.post("/logout", userController.logout);



//catch all
router.get('/404',userController.catchAll)

module.exports = router;
