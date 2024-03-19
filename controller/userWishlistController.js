const categoryModal = require("../models/catagory");
const wishlistModal = require("../models/wishlist");
const productModal = require("../models/products");

const wishlist = async (req, res) => {
    try {
      const wishlist = await wishlistModal
        .findOne({ userId: req.session.login })
        .populate("products.productId");
  
      console.log(wishlist);
      if (wishlist) {      
        const category = await categoryModal.find({});
        res.render("client/wishlist", {
          login: req.session.login,
          wishlist,
          category,
        });
      } else {
        const category = await categoryModal.find({});
        res.render("client/wishlist", {
          login: req.session.login,
          category,
        });
      }
    } catch (err) {
      console.log(err.message + "      cart page route");
    }
  }
  
  const addToWishlist = async (req, res) => {
    try {
      const product = await productModal.findOne({ _id: req.body.id });
      const result = await wishlistModal
        .findOne({
          userId: req.body.user,
          products: {
            $elemMatch: {
              productId: req.body.id,
            },
          },
        })
        .exec();
      if (!result) {
        const tp = product.price * req.body.q;
  
        const filter = { userId: req.body.user };
        const update = {
          $set: {
            userId: req.body.user,
          },
          $addToSet: {
            products: { productId: req.body.id, price: tp },
          },
        };
        const options = {
          upsert: true,
          new: true,
        };
  
        const wishlistSuccess = await wishlistModal
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
  }
  
  const wishlistRemove = async (req, res) => {
    try {
  
      const remove = await wishlistModal.updateOne(
        { _id: req.body.id },
        {
          $pull: { products: { productId: req.body.proid } },
        }
      );
      if (remove.modifiedCount === 0) {
        res.send({ failure: "can't remove" });
      } else {
        const rdata = await wishlistModal.findOne({ _id: req.body.id });
        console.log(rdata);
        res.send({ rdata , success: "success" });
      }
    } catch (err) {
      console.log(err.message + "   wishlistremove");
    }
};
  
module.exports = {
    wishlist,
    addToWishlist,
    wishlistRemove
}