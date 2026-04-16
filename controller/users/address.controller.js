const Address = require("../../models/address");
const User = require("../../models/userSchema");
const Category = require("../../models/catagory");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

/**
 * @desc    Render Address Page
 * @route   GET /address
 */
const getAddressPage  = async (req, res) => {
  try {
    const userId = req.session.login;
    const user = await User.findOne({ _id: userId });
    const category = await Category.find({isDeleted: false, listed: true});

    if (user.is_admin === 0) {
      const address = await Address.findOne({ userId });
      if (address) {
      }
      const cartCount = await getCartCount(userId);
      const wishlistCount = await getWishlistCount(userId)

      res.render("user/address", {
        user,
        login: userId,
        address,
        category,
        cartCount,
        wishlistCount
      });
    } else {
      req.session.admin = user;
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err.message + "   address route");
  }
};

/**
 * @desc    Add New Address
 * @route   POST /address
 */
const addAddress = async (req, res) => {
  try {
    const userId = req.session.login;
    const { name, city, state, pincode } = req.body;
    const exists = await Address.findOne({
      userId,
      address: { $elemMatch: { name: name } },
    });
    if (!exists) {
      const update = {
        $set: { userId },
        $addToSet: {
          address: { name, city, state, pincode }
        },
      };
      const options = {
        upsert: true,
        new: true,
      };

      const newAddress = await Address.findOneAndUpdate(
        { userId },
        update,
        options
      );
      if (newAddress) {
        res.redirect("/address");
      } else {
        res.send("address didnt find");
      }
    } else {
    }
  } catch (err) {
    console.log(err.message + "    get addresss route");
  }
};

/**
 * @desc    Check Address Exists 
 * @route   PUT /address
 */
const checkAddressExists  = async (req, res) => {
  try {
    const { id, val } = req.body;
    const exists = await Address.findOne({
      userId: id,
      address: { $elemMatch: { name: val } },
    });
    if (exists) {
      res.send({ exists });
    } else {
      res.send({ note: "note" });
    }
  } catch (err) {
    console.log(err.message + "    gpatch addresss route");
  }
};

/**
 * @desc    Delete Address
 * @route   DELETE /address
 */
const deleteAddress = async (req, res) => {
  try {
    const { uid, id } = req.body;
    const result = await Address.updateOne(
      { userId: uid },
      { $pull: { address: { _id: id } } }
    );

    if (result.modifiedCount === 0) {
      console.log("address not removed");
    } else {
      res.send({ result });
    }
  } catch (err) {
    console.log(err.message + "   remove addresss");
  }
};

/**
 * @desc    Set Default Address
 * @route   PUT /address/default
 */
const setDefaultAddress  = async (req, res) => {
  try {
    const { uid, id } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: uid },
      { $set: { addressId: id } },
      { new: true }
    );
    if (updatedUser) {
      res.send({ done: updatedUser });
    } else {
      res.send({ done: "not added" });
    }
  } catch (err) {
    console.log(err.message + "        Defaddress route ");
  }
};

module.exports = {
  getAddressPage,
  addAddress,
  checkAddressExists,
  deleteAddress,
  setDefaultAddress,
};
