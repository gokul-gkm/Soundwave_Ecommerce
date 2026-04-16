const Category = require("../../models/catagory");
const Wishlist = require("../../models/wishlist");
const Product = require("../../models/products");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

/**
 * @desc    Render Wishlist Page
 * @route   GET /wishlist
 */
const getWishlistPage = async (req, res) => {
  try {
    const userId = req.session.login;
    const wishlist = await Wishlist
      .findOne({ userId})
      .populate("products.productId");
      const cartCount = await getCartCount(userId);
      const wishlistCount = await getWishlistCount(userId)
    if (wishlist) {
      const category = await Category.find({isDeleted: false, listed: true});
      res.render("user/wishlist", { login: userId, wishlist, category ,cartCount,wishlistCount});     
    } else {
      const category = await Category.find({isDeleted: false, listed: true});
      res.render("user/wishlist", { login: userId, category ,cartCount,wishlistCount});
    }
  } catch (err) {
    console.log(err.message + "      cart page route");
  }
};

/**
 * @desc    Add Product to Wishlist
 * @route   POST /wishlist
 */
const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.login;
    const { id, q } = req.body;
    const product = await Product.findOne({ _id: id });
    const result = await Wishlist
      .findOne({
        userId: userId,
        products: {
          $elemMatch: {
            productId: id,
          },
        },
      })
      .exec();
    if (!result) {
      const tp = product.price * q;
      const filter = { userId };
      const update = {
        $set: {
          userId: userId,
        },
        $addToSet: {
          products: { productId: id, price: tp },
        },
      };
      const options = {
        upsert: true,
        new: true,
      };

      const wishlistSuccess = await Wishlist
        .findOneAndUpdate(filter, update, options)
        .exec();

      if (wishlistSuccess) {
        res.send({ success: "success" });
      }
    } else {
      res.send({ exist: "it is already exist" });
    }
  } catch (err) {
    console.log(err.message + "      wishlist put fecth routre");
  }
};

/**
 * @desc    Remove Product from Wishlist
 * @route   DELETE /wishlist/:productId
 */
const removeFromWishlist  = async (req, res) => {
  try {
    const remove = await Wishlist.updateOne(
      { _id: req.body.id },
      {
        $pull: { products: { productId: req.body.proid } },
      }
    );
    if (remove.modifiedCount === 0) {
      res.send({ failure: "can't remove" });
    } else {
      const rdata = await Wishlist.findOne({ _id: req.body.id });
      res.send({ rdata, success: "success" });
    }
  } catch (err) {
    console.log(err.message + "   wishlistremove");
  }
};

module.exports = {
  getWishlistPage,
  addToWishlist,
  removeFromWishlist,
};
