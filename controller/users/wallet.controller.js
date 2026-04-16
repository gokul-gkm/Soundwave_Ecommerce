const Wallet = require("../../models/wallet");
const Category = require("../../models/catagory");
const { getCartCount, getWishlistCount } = require("../../utils/count");

/**
 * @desc    Get User Wallet History
 * @route   GET /wallet
 */
const getWalletHistory = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const userId = req.session.login;
    const walletOld = await Wallet
      .find({ userId})
      .skip(skip)
      .limit(limit);
    const le = await Wallet.findOne({ userId });
    const trancount = le.length;

    const totalPages = Math.ceil(trancount / limit);   
    if (walletOld.length != 0 && totalPages < page) {
      res.redirect(`/wallet`);
    }
    const category = await Category.find({
      isDeleted: false, 
      listed: true,
    });
    const walletData =
      (await Wallet.findOne({ userId })) || [];
    
    const cartCount = await getCartCount(userId);
    const wishlistCount = await getWishlistCount(userId)
    res.render("user/walletHistory", {
      login: userId,
      category,
      wallet: walletData,
      le: le.length,
      totalPages,
      currentPage: page,
      wishlistCount,
      cartCount 
    });
  } catch (err) {
    console.log(err.message + "wallet history");
    res.status(400).send({ err: err.message });
  }
};

module.exports = { getWalletHistory };