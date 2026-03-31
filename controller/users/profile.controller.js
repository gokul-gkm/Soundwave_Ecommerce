const categoryModel = require("../../models/catagory");
const { getCartCount, getWishlistCount } = require("../../utils/count");
const wallet = require("../../models/wallet");
const userSchema = require("../../models/userSchema");

/**
 * @desc    Render Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    if (req.query.passwordChanged === "true") {
      res.locals.passwordChangedAlert =
        "Your password has been changed successfully.";
    }

    const category = await categoryModel.find({
      isDeleted: false,
      listed: true,
    });

    const cartCount = await getCartCount(req.session.login);
    const wishlistCount = await getWishlistCount(req.session.login)

    

    const user = await userSchema.findOne({ _id: req.session.login });

    const wallet1 = await wallet.findOne({ userId: req.session.login });
    const walletAmount = wallet1?.amount || 0;

    if (user.is_admin === 0) { 
      res.render("user/profile", {
        user,
        login: req.session.login,
        category,
        walletAmount,
        cartCount,
        wishlistCount,
        wallet1
      });
    } else {
      req.session.admin = user;
      res.redirect("/admin");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.query.userId;

    const { name, phone } = req.body;

    const updatedUser = await userSchema.findOneAndUpdate(
      { _id: userId },
      { $set: { name, phone } },
      { new: true }
    );
    if (updatedUser) {
      res.redirect("/profile");
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};