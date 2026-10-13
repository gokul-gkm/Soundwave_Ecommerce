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

        if (!userId) {
            return res.status(401).json({ error: 'Please login to apply a coupon' });
        }

        const couponCode = String(req.body.id || '').trim();

        if (!couponCode) {
            return res.status(400).json({ error: 'Please enter a coupon code' });
        }

        // Find the user and check if they own this coupon code
        const userWithCoupon = await User
            .findOne({ _id: userId, 'coupens.ID': couponCode })
            .populate('coupens.coupenId');

        if (!userWithCoupon) {
            return res.status(404).json({ error: 'Invalid coupon code or coupon not assigned to your account' });
        }

        // Find the matching coupon entry
        const matchedCoupon = userWithCoupon.coupens.find(c => c.ID === couponCode);

        if (!matchedCoupon || !matchedCoupon.coupenId) {
            return res.status(404).json({ error: 'Coupon details not found' });
        }

        // Save coupon to session for use at checkout
        req.session.coupenId = couponCode;
        req.session.offer = matchedCoupon.coupenId.offer;

        return res.json({
            success: true,
            offer: matchedCoupon.coupenId.offer,
            message: `Coupon applied! You get ${matchedCoupon.coupenId.offer}% off`
        });

    } catch (err) {
        console.log(err.message + ' coupenCode');
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

module.exports = {
    getCouponsPage,
    applyCoupon 
}