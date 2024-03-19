const express = require('express');
const router = express.Router();
const userController = require('../controller/userControlller');
const userAddressController = require('../controller/userAddressController');
const userCartController = require('../controller/userCartController');
const userOrderController = require('../controller/userOrderController');
const userCoupenController = require('../controller/userCoupenController');
const userWishlistController = require('../controller/userWishlistController');
const userMidleware = require('../middleware/user');
const { check, validationResult } = require('express-validator');
// const { validateSignup, checkValidation } = require('../middleware/validation.js');


// get home page
router.get('/',userMidleware.userbloack,userController.home);

//login page rendering
router.get('/login', userMidleware.loginTrue, userController.signUp);

//about page rendering
router.get('/about', userController.about);

//email exist checking
router.post('/login', userController.emailExist);

//post login
router.post('/sign-up',userController.getSignUp)

//otp
router.get('/otp',userMidleware.loginTrue,userController.otp)

//resend the otp
router.get('/resend',userController.resend)

//otp getting
router.post('/otp',userController.gettingOtp)

//resubmit the email in otp
router.post('/resubmit',userController.resubmit)

//forgetPassword
router.get('/forgetPassword',userMidleware.loginTrue,userController.forgetPassword);

//forgetpass fetching
router.post('/forgetPass',userController.forgetemailExist)

//forget redirecting to otp
router.post('/forget',userController.forget);

// enter the new password and upadating 
router.get('/newPass',userController.newPass)

// get new pass
router.post('/newPass',userController.getNewPass)

//getting login details
router.post('/sign-in',userController.getLogin)

//products route 
router.get('/products', userMidleware.userbloack, userController.products)
//products route 
router.get('/product', userMidleware.userbloack, userController.product)

//category route 
router.get('/category',userMidleware.userbloack,userController.category)

//profile route
router.get('/profile', userMidleware.userbloack, userMidleware.user, userController.profile);

//Edit profile post
router.post('/editProfile',userController.editProfile);

//profile route
router.get('/productDets', userMidleware.userbloack, userController.productDets);

/***************Cart***************/

//CART PAGE RENDERING route
router.get('/cart',userMidleware.userbloack,userMidleware.user,userCartController.cart);

// add cart fetching
router.put('/addcart',userCartController.addcart)

//add cart on post requuser
router.post('/addcart',userCartController.addcartPost)

//cart stock increasing fetching 
router.put('/cartUpdate', userCartController.cartEdit)

//deleate cart 
router.delete('/cartremove', userCartController.cartree)

/***************Cart***************/

//wishlist page rendering route
router.get('/wishlist',userMidleware.userbloack,userMidleware.user,userWishlistController.wishlist);

//add to wishlist post
router.post('/addToWishList', userWishlistController.addToWishlist)

//remove from wishlist 
router.delete('/wishlistremove',userWishlistController.wishlistRemove)

/***************Address***************/

//adress route
router.get('/adress',userMidleware.userbloack,userMidleware.user,userAddressController.adress);

// getting addresss
router.post('/adress', userAddressController.getadress);

//fetching adress exists or note 
router.put('/address', userAddressController.patchaddress);

//remove address
router.delete('/address', userAddressController.removeadress);

// defulat address fetching
router.put('/Defaddress', userAddressController.Defaddress);


/***************Order***************/


router.get('/checkoutPage', userMidleware.userbloack, userMidleware.user, userOrderController.checkoutPage);

//  order det page rendering
router.get('/order',userMidleware.userbloack,userMidleware.user,userOrderController.orderDet)

//  order det page rendering
router.get('/orderView/:id', userMidleware.userbloack, userMidleware.user, userOrderController.orderView);

//order canceling 
router.put('/editOrder', userOrderController.editOrder);

// succes msg rendering
router.get('/success', userMidleware.userbloack, userMidleware.user, userOrderController.success);

//succes post route
router.post('/success', userOrderController.postSucces);



//razorpay
router.post('/razor', userOrderController.razor);

router.get('/walletHistory',userMidleware.userbloack,userMidleware.user,userOrderController.walletHistory)

//invoice download
router.get('/invoice/:id', userOrderController.invoice)

//review
router.post('/submit-review/:proId', userOrderController.reviewPost);

/*****************Coupens***************** */ 

//  order det page rendering
router.get('/coupen', userMidleware.userbloack, userMidleware.user, userCoupenController.coupenView)

//coupen code posting
router.post('/coupenCode/:id',userCoupenController.coupenCode);

//logout
router.post('/logout', userController.logout);


module.exports = router;
