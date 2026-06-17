const Category = require("../../models/catagory");
const { getCartCount, getWishlistCount } = require("../../utils/count");
const Wallet = require("../../models/wallet");
const User = require("../../models/userSchema");

/**
 * @desc    Render Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    if (req.query.passwordChanged === "true") {
      res.locals.passwordChangedAlert =
        "Your password has been changed successfully.";
    }

    const category = await Category.find({
      isDeleted: false,
      listed: true,
    });

    const cartCount = await getCartCount(req.session.login);
    const wishlistCount = await getWishlistCount(req.session.login)

    const user = await User.findOne({ _id: req.session.login });

    const wallet1 = await Wallet.findOne({ userId: req.session.login });
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

    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (trimmedName.length < 3 || trimmedName.length > 40) {
      return res.status(400).json({ success: false, message: "Name must be between 3 and 40 characters" });
    }
    if (!/^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/.test(trimmedName)) {
      return res.status(400).json({ success: false, message: "Name can contain letters, numbers, and single spaces only" });
    }
    const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 3) {
      return res.status(400).json({ success: false, message: "Name must contain at least 3 letters" });
    }

    const trimmedPhone = (phone || '').trim();
    if (!trimmedPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const cleanPhone = trimmedPhone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: "enter a valid phone number" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { name: trimmedName, phone: trimmedPhone } },
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