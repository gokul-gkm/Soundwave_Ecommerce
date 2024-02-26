const express = require('express');
const router = express.Router();
const userController=require('../controller/userControlller')
const userMidleware = require('../middleware/user')
const { check, validationResult } = require('express-validator');
// const { validateSignup, checkValidation } = require('../middleware/validation.js');

const validateSignup = [
    check('registerName', 'name must be greater  than 3+ charaters')
        .trim()
        .exists()
        .isLength({ min: 3 }),
    check('registerEmail', 'enter a valid email')
        .trim()
        .isEmail(),
    check('registerPassword', 'password must be 3+ characters')
        .trim()
        .isLength({ min: 3 }),
    check('registerConfirmPassword', 'password do not match')
        .trim()
        .custom((value, { req }) => {
            if (value == !req.body.registerPassword) {
                throw new Error('Password do not match')
            }
            return true;
        })   
]

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

//category route 
router.get('/category',userMidleware.userbloack,userController.category)

//profile route
router.get('/profile',userMidleware.userbloack,userMidleware.user,userController.profile);

//profile route
router.get('/productDets',userMidleware.userbloack,userController.productDets);

//CART PAGE RENDERING route
router.get('/cart',userMidleware.userbloack,userMidleware.user,userController.cart);

//wishlist PAGE RENDERING route
router.get('/wishlist',userMidleware.userbloack,userMidleware.user,userController.wishlist);

// add cart fetching
router.put('/addcart',userController.addcart)

//ad cart on post requuser
router.post('/addcart',userController.addcartPost)

//cart stock increasing fetching 
router.put('/cartUpdate', userController.cartEdit)

//deleate cart 
router.delete('/cartremove',userController.cartree)

router.get('/checkoutPage', userMidleware.userbloack, userMidleware.user, userController.checkoutPage);



// succes msg rendering
router.get('/success',userMidleware.userbloack,userMidleware.user,userController.success)

//succes post route
router.post('/success', userController.postSucces)

//adress route
router.get('/adress',userMidleware.userbloack,userMidleware.user,userController.adress);

// getting addresss
router.post('/adress',userController.getadress)

//fetching adress exists or note 
router.put('/address',userController.patchaddress)

//remove address
router.delete('/address',userController.removeadress)

// defulat address fetching
router.put('/Defaddress', userController.Defaddress)

//  order det page rendering
router.get('/order',userMidleware.userbloack,userMidleware.user,userController.orderDet)

//  order det page rendering
router.get('/orderView/:id', userMidleware.userbloack, userMidleware.user, userController.orderView);

//order canceling 
router.put('/editOrder', userController.editOrder)



//logout
router.post('/logout',userController.logout)


module.exports = router;
