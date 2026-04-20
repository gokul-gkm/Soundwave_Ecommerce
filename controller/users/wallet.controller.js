const mongoose = require("mongoose");
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

    // First find the wallet to get the total count of transactions
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      const category = await Category.find({ isDeleted: false, listed: true });
      const cartCount = await getCartCount(userId);
      const wishlistCount = await getWishlistCount(userId);
      
      return res.render("user/walletHistory", {
        login: userId,
        category,
        wallet: { amount: 0, transaction: [] },
        totalPages: 0,
        currentPage: page,
        wishlistCount,
        cartCount,
        skip: 0
      });
    }

    const trancount = wallet.transaction.length;
    const totalPages = Math.ceil(trancount / limit);

    // Use aggregation to reverse transactions and slice for pagination
    const walletAggregation = await Wallet.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          amount: 1,
          transaction: {
            $slice: [
              { $reverseArray: "$transaction" },
              skip,
              limit
            ]
          }
        }
      }
    ]);

    const walletData = walletAggregation[0] || { amount: 0, transaction: [] };

    const category = await Category.find({
      isDeleted: false,
      listed: true,
    });

    const cartCount = await getCartCount(userId);
    const wishlistCount = await getWishlistCount(userId);

    res.render("user/walletHistory", {
      login: userId,
      category,
      wallet: walletData,
      totalPages,
      currentPage: page,
      wishlistCount,
      cartCount,
      skip
    });
  } catch (err) {
    console.log(err.message + " wallet history error");
    res.status(500).send({ err: err.message });
  }
};

module.exports = { getWalletHistory };