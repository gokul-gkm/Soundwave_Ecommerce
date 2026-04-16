const Category = require("../../models/catagory");
const User = require("../../models/userSchema");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

/**
 * @desc    Render Coupon Page
 * @route   GET /coupons
 */
const getCouponsPage = async (req, res) => {
    try {
        const userId = req.session.login;

        const category = await Category.find({isDeleted: false, listed: true})
        const coupen = await User.findOne({ _id: userId }).populate('coupens.coupenId')
        const cartCount = await getCartCount(userId);
        const wishlistCount = await getWishlistCount(userId)
        res.render('user/coupen', { login: userId, coupen: coupen.coupens, category,wishlistCount,cartCount })
    } catch (err) {
        console.log(err.message + '     coupenView')
    }
  }
  
  /**
 * @desc    Apply Coupon Code
 * @route   POST /coupons/apply
 */
  const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.login;
        const hh = req.body.id.trim()
        const id = String(hh)
        const dataExist = await User.findOne({ _id: userId, 'coupens.ID': id }).populate("coupens.coupenId");
        req.session.coupenId = id
        let offer;
        dataExist.coupens.forEach((e) => {
            if (e.ID == id) {
                offer = e.coupenId.offer
            }
        })
        req.session.offer = offer
        if (dataExist) {
            res.redirect('/checkout')
        } else {
            req.flash('msg', "coupen didn't exist")
            res.redirect('/cart')
        }
    } catch (err) {
        console.log(err.message + ' coupenCode')
    }
}
  
module.exports = {
    getCouponsPage,
    applyCoupon 
}