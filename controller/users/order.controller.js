const mongoose = require('mongoose');
const User = require("../../models/userSchema");
const Category = require("../../models/catagory");
const Address = require("../../models/address");
const Cart = require("../../models/cart");
const Product = require("../../models/products");
const Order = require("../../models/orders");
const Wallet = require("../../models/wallet");

const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const invoiceConfig = require("../../config/invoice");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

/**
 * @route   GET /checkout
 * @desc    Render Checkout Page
 */
const getCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.login;
    const category = await Category.find({
      listed: true,
      isDeleted: false,
    });
    const coupenOffer = req.session.offer || 0;

    console.log(coupenOffer + "co")
    const user = await User.findOne({ _id: userId });
    const cart = await Cart
      .findOne({ userId })
      .populate("products.productId");

    const nonBlockedProduct = cart.products.filter((e) => e.productId.listed);

    const BlockedProduct = cart.products.filter((e) => !e.productId.listed);
    for (const el of BlockedProduct) {
      if (!el.productId.listed) {
        const doc = await Cart.findOneAndUpdate(
          { userId },
          { $pull: { products: { productId: el.productId._id } } },
          { new: true }
        );
      }
    }

    let total1 = nonBlockedProduct.reduce(
      (acc, product) => acc + product.price,
      0
    );

    if (coupenOffer >= 0) {           
      total1  = total1 - (total1 * coupenOffer)/100;
    }

    console.log(total1 + "tot1")
    const total = Number(total1.toFixed(1));
    const wallet1 = await Wallet.findOne({ userId });
    const walletAmount = wallet1?.amount || 0;
    let add;
    const address = await Address.findOne({ userId });
    const totalPriceAdding = await Cart
      .findOneAndUpdate(
        { userId },
        { $set: { TotalPrice: total } },
        { new: true }
      )
      .populate("products.productId")
      .exec();

    const cartCount = await getCartCount(userId);
    const wishlistCount = await getWishlistCount(userId)
    
    if (address) {
      const add = address?.address.find(
        (e) => e._id + "hh" == user.addressId + "hh"
      );

      res.render("user/checkout", {
        login: userId,
        add,
        cart: totalPriceAdding,
        category,
        coupenOffer,
        walletAmount,
        cartCount,
        wishlistCount
      });
    } else {
      res.render("user/checkout", {
        login: req.session.login,
        cart: totalPriceAdding,
        category,
        coupenOffer,
        walletAmount,
        cartCount,
        wishlistCount
      });
    }
  } catch (err) {
    console.log(err.message + "     checkoutPage page rendiering route");
  }
};

/**
 * @desc    Render Order Success Page
 * @route   GET /orders/success
 */
const getOrderSuccessPage = async (req, res) => {
  try {
    const userId = req.session.login;
    const category = await Category.find({ isDeleted: false });
    const cartCount = await getCartCount(userId);
      const wishlistCount = await getWishlistCount(userId)
    if (req.session.succes) {
      delete req.session.succes;
      res.render("user/success", { login: userId, category, cartCount, wishlistCount });
    } else {
      res.redirect("/order");
    }
  } catch (err) {
    console.log(err.message + "   succes page rendering");
  }
};

/**
 * @route   POST /orders
 * @desc    Handle Successful Order Placement
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.session.login;
    const offer = req.session.offer || 0;
    const user = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ userId });
    const subtotal = cart.TotalPrice;

    const orderAmount = subtotal.toFixed(1);
    const orderSet = await Order.create({
      userId,
      orderAmount: orderAmount,
      deliveryAddress: user.addressId,
      peyment: req.body.peyment,
      deliveryAddress: {
        name: req.body.name,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      },
      orderDate: new Date(),
      coupen: offer,
      OrderedItems: cart.products.map((e) => ({
        productId: e.productId,
        quantity: e.quantity,
        price: e.price,
      })),
    });

    if (req.session.offer && req.session.coupenId) {
      const hh = req.session.coupenId.trim();
      const id = String(hh);
      const coupenRemove = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { coupens: { ID: id } } }
      );
    }

    if (req.body.peyment == "wallet") {
      const ne = 0 - subtotal.toFixed(1);
      const debitAmount = ne * -1;
      await Wallet.findOneAndUpdate(
        { userId},
        {
          $inc: { amount: ne },
          $push: {
            transaction: { amount: debitAmount, creditOrDebit: "debit" , source: "product ordered", orderId: orderSet._id},
          },
        }
      );
    }

    if (orderSet) {
      orderSet.OrderedItems.forEach(async (e) => {
        let product = await Product.findOne({ _id: e.productId });
        let newstock = product.stock - e.quantity;
        let pr = await Product.findOneAndUpdate(
          { _id: e.productId },
          { $set: { stock: newstock } }
        );
      });

      const removeCart = await Cart.updateOne(
        { userId: req.session.login },
        { $unset: { products: 1 } }
      );
      if (removeCart) {
        req.session.succes = true;
        res.redirect("/orders/success");
      } else {

      }
    } else {
      res.send("irs note");
    }
  } catch (err) {
    console.log(err.message + "    postSucces");
  }
};

/**
 * @desc    Get User Orders
 * @route   GET /orders
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.session.login;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const category = await Category.find({ isDeleted: false });
    
    const totalOrders = await Order.countDocuments({ userId });
    const order = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalOrders / limit);
    const cartCount = await getCartCount(userId);
    const wishlistCount = await getWishlistCount(userId);

    res.render("user/orderDet", {
      login: userId,
      order,
      category,
      ordercount: totalOrders,
      currentPage: page,
      totalPages,
      limit,
      cartCount,
      wishlistCount
    });
  } catch (err) {
    console.log(err.message + " orderdet page rendering ");
    res.status(500).send("Internal Server Error");
  }
};

/**
 * @route   GET /orders/:id
 * @desc    Get Order Details by ID
 */
const getOrderById = async (req, res) => {
  try {  
    const orderId = req.params.id;
    const userId = req.session.login;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send('Invalid order ID');
    }

    const category = await Category.find({ isDeleted: false });

    const order = await Order
      .findOne({ _id: orderId })
      .populate("OrderedItems.productId");
    
    const cartCount = await getCartCount(userId);
    const wishlistCount = await getWishlistCount(userId)
    
    res.render("user/order", { login: userId, order, category ,wishlistCount,cartCount});
  } catch (err) {
    console.log(err.message + "      ORDER VIEW PAGE RENDERING ");
  }
};

/**
 * @desc    Cancel Order Item
 * @route   PUT /orders/cancel
 */
const cancelOrderItem = async (req, res) => {
  try {
    const cancelReason = req.body.cancelReason;
    const orderId = req.body.orderId;
    const userId = req.session.login;
    
    const newOne = await Order.findOneAndUpdate(
      { userId, "OrderedItems.productId": req.body.id , _id: orderId},
      {
        $set: {
          "OrderedItems.$.canceled": true,
          "OrderedItems.$.orderProStatus": "canceled",
          "OrderedItems.$.cancelReason": cancelReason,
        },
      },
      { new: true }
    );

    if (newOne) {
      if (newOne.OrderedItems.length == 1) {
        const k = await Order.findOneAndUpdate(
          { _id: newOne._id },
          { $set: { orderStatus: "canceled" } },
          { new: true } 
        );
        
      } else {
        let flag = newOne.OrderedItems.filter(
          (e) => e.orderProStatus === "canceled"
        ).length;

        if (flag === newOne.OrderedItems.length) {
          const k = await Order.findOneAndUpdate(
            { _id: newOne._id },
            { $set: { orderStatus: "canceled" } },
            { new: true } 
          );     
        }
      }

      if (newOne.peyment != "cod") {
        await Wallet.findOneAndUpdate(
          { userId },
          {
            $inc: { amount: req.body.price },
            $push: {
              transaction: { amount: req.body.price, creditOrDebit: "credit" , source: "refund from canceled order ", orderId: orderId},
            },
          },
          { new: true, upsert: true }
        );
      }

      res.send({ set: true });
    } else {
      res.send({ issue: true });
    }
  } catch (err) {
    console.log(err.message + " editOrder");
  }
};

/**
 * @desc    Return Order Item
 * @route   PUT /orders/return
 */
const returnOrderItem = async (req, res) => {
    
  try {
      const { proId, ordId, price, reason } = req.body;
      
      const returnMsg = await Order.findOneAndUpdate({ _id: ordId, 'OrderedItems.productId': proId }, {
          $set: {
              'OrderedItems.$.returned': true, "OrderedItems.$.returnReason": reason,
          }
      });

      if (returnMsg) {
          console.log("return success");
      } else {
          console.log("return fail");
      }
  } catch (error) {
      console.log(error.message); 
  }
};

/**
 * @desc    Download Invoice by Order ID
 * @route   GET /invoice/:id
 */
const downloadInvoice = async (req, res) => {
  try {
    if (req.params.id) {
      const uuidb = uuid();
      const orderDta = await Order
        .findOne({ _id: req.params.id })
        .populate("OrderedItems.productId userId");

      const inv = invoiceConfig(orderDta);
      const result = await easyinvoice.createInvoice(inv);
      const filePath = path.join(
        __dirname,
        "../../public/files",
        `invoice_${uuidb}.pdf`
      );
      await fs.writeFileSync(filePath, result.pdf, "base64");

      res.download(filePath, `invoice_${uuidb}.pdf`, (err) => {
        console.log("invoice download");
        if (!err) {
          fs.unlinkSync(filePath);
        } else {
          console.error(err);
        }
      });
    } else {
      res.status(404).send("Invoice ID not provided");
    }
  } catch (err) {
    console.log(err.message + "invoice");
  }
};

module.exports = {
  getCheckoutPage,
  createOrder,
  getOrders,
  getOrderById,
  cancelOrderItem,
  returnOrderItem,
  getOrderSuccessPage,
  downloadInvoice
};
