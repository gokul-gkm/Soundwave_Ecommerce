const Category = require("../../models/catagory");
const Cart = require("../../models/cart");
const Product = require("../../models/products");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

/**
 * @desc    Render Cart Page
 * @route   GET /cart
 */
const renderCartPage = async (req, res) => {
  try {
    const userId = req.session.login;    
    const cart = await Cart
      .findOne({ userId })
      .populate("products.productId");
      const cartCount = await getCartCount(userId);
      const wishlistCount = await getWishlistCount(userId)
    if (cart) {
      const total = cart.products.reduce(
        (acc, product) => acc + product.price,
        0
      );
      const options = {
        upsert: true,
        new: true,
      };
      const totalPriceAdding = await Cart
        .findOneAndUpdate(
          { userId },
          { $set: { TotalPrice: total } },
          options
        )
        .exec();
      const category = await Category.find({});
      res.render("user/cart", {
        login: userId,
        cart,
        totalprice: totalPriceAdding.TotalPrice,
        category,
        cartCount,
        wishlistCount
      });
    } else {
      const category = await Category.find({});
      res.render("user/cart", {
        login: userId,
        totalprice: 0,
        category,
        cartCount,
        wishlistCount
      });
    }
  } catch (err) {
    console.log(err.message + "      cart page route");
  }
};

/**
 * @desc    Add to Cart (API)
 * @route   PUT /cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.session.login;
    const { id, q } = req.body;
    const product = await Product.findOne({ _id: id });
    const result = await Cart
      .findOne({
        userId,
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
          userId,
        },
        $addToSet: {
          products: { productId: id, price: tp },
        },
      };
      const options = {
        upsert: true,
        new: true,
      };

      const cartSuccess = await Cart
        .findOneAndUpdate(filter, update, options)
        .exec();

      if (cartSuccess) {
        res.send({ success: "succes" });
      }
    } else {
      res.send({ exist: "it is already exist" });
    }
  } catch (err) {
    console.log(err.message + "      addCart put fecth routre");
  }
};

/**
 * @desc    Add to Cart (Form)
 * @route   POST /cart
 */
const addToCartFromForm  = async (req, res) => {
  try {
    const userId = req.session.login;
    const { id } = req.query;
    const { q } = req.body;
    if (userId) {
      const product = await Product.findOne({ _id: id });
      const result = await Cart
        .findOne({
          userId,
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
            userId,
          },
          $addToSet: {
            products: {
              productId: id,
              price: tp,
              quantity: q,
            },
          },
        };
        const options = {
          upsert: true,
          new: true,
        };

        const cartSuccess = await Cart
          .findOneAndUpdate(filter, update, options)
          .exec();

        if (cartSuccess) {
          res.redirect(`/cart?id=${req.query.user}`);
        }
      } else {
        const tp = product.price * q;
        const updatedCart = await Cart.findOneAndUpdate(
          { userId, "products.productId": id },
          {
            $set: {
              "products.$.price": tp,
              "products.$.quantity": q,
            },
          },
          { new: true }
        );
        if (updatedCart) {
          res.redirect(`/cart?id=${req.query.user}`);
        } else {
          res.send("somthing issues");
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "    addcartpost route");
  }
};

/**
 * @desc    Update Cart Item Quantity
 * @route   PUT /cart-update
 */
const updateCartItem  = async (req, res) => {
  try {
    const { id, productId, quantity } = req.body;

    const product = await Product.findOne({ _id: productId});
    const newval = product.price * quantity;

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: id, "products.productId": productId},
      {
        $set: {
          "products.$.price": newval,
          "products.$.quantity": quantity,
        },
      },
      { new: true }
    );

    const total = updatedCart.products.reduce(
      (acc, product) => acc + product.price,
      0
    );

    await Cart.findOneAndUpdate(
      { _id: id },
      { $set: { TotalPrice: total } }
    );

    res.send({ su: total });
  } catch (err) {
    console.log(err.message + "   cart edit ");
  }
};

/**
 * @desc    Remove Cart Item
 * @route   DELETE /cart
 */
const removeCartItem  = async (req, res) => {
  try {
    const { id, proid, tot } = req.body;

    console.log(req.body.tot);
    const remove = await Cart.updateOne(
      { _id: id },
      {
        $set: { TotalPrice: tot },
        $pull: { products: { productId: proid } },
      }
    );
    if (remove.modifiedCount === 0) {
    } else {
      const rdata = await Cart.findOne({ _id: id });
      console.log(rdata);
      res.send({ rdata });
    }
  } catch (err) {
    console.log(err.message + "   catrreeee");
  }
};

module.exports = {
  renderCartPage,
  addToCart,
  addToCartFromForm,
  updateCartItem,
  removeCartItem,
};
