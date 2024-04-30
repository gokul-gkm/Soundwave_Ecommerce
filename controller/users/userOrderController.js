const userSchema = require("../../models/userSchema");
const categoryModal = require("../../models/catagory");
const addressModal = require("../../models/adress");
const cartModal = require("../../models/cart");
const productModal = require("../../models/products");
const orderModal = require("../../models/orders");
const wallet = require("../../models/wallet");
const reviews = require("../../models/reviews");
const mongoose = require('mongoose');

const Razorpay = require("razorpay");
const { order } = require("../admin/adminOrderController");

const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const invoiceConfig = require("../../config/invoice");
const { getWishlistCount ,getCartCount} = require('../../utils/count'); 
const { Page } = require("puppeteer");
const { log } = require("console");

const bodyParser = require('body-parser');
const crypto = require('crypto');

require("dotenv").config();
const { RAZORPAY_IDKEY, RAZORPAY_SECRET_KEY } = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_IDKEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
  try {
    const category = await categoryModal.find({
      listed: true,
      isDeleted: false,
    });
    const coupenOffer = req.session.offer || 0;

    console.log(coupenOffer + "co")
    const user = await userSchema.findOne({ _id: req.session.login });
    const cart = await cartModal
      .findOne({ userId: req.session.login })
      .populate("products.productId");

    const nonBlockedProduct = cart.products.filter((e) => e.productId.listed);

    const BlockedProduct = cart.products.filter((e) => !e.productId.listed);
    for (const el of BlockedProduct) {
      if (!el.productId.listed) {
        const doc = await cartModal.findOneAndUpdate(
          { userId: req.session.login },
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
    const wallet1 = await wallet.findOne({ userId: req.session.login });
    const walletAmount = wallet1?.amount || 0;
    let add;
    const adress = await addressModal.findOne({ userId: req.session.login });
    const totalPriceAdding = await cartModal
      .findOneAndUpdate(
        { userId: req.session.login },
        { $set: { TotalPrice: total } },
        { new: true }
      )
      .populate("products.productId")
      .exec();

    const cartCount = await getCartCount(req.session.login);
    const wishlistCount = await getWishlistCount(req.session.login)
    
    if (adress) {
      const add = adress?.address.find(
        (e) => e._id + "hh" == user.addressId + "hh"
      );

      res.render("user/checkout", {
        login: req.session.login,
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

//succes msg rendering
const success = async (req, res) => {
  try {
    const category = await categoryModal.find({ isDeleted: false });
    const cartCount = await getCartCount(req.session.login);
      const wishlistCount = await getWishlistCount(req.session.login)
    if (req.session.succes) {
      delete req.session.succes;
      res.render("user/succes", { login: req.session.login, category, cartCount, wishlistCount });
    } else {
      res.redirect("/order");
    }
  } catch (err) {
    console.log(err.message + "   succes page rendering");
  }
};

//postSucces
const postSucces = async (req, res) => {
  try {
    const offer = req.session.offer || 0;
    const user = await userSchema.findOne({ _id: req.session.login });
    const cart = await cartModal.findOne({ userId: req.session.login });
    const subtotal = cart.TotalPrice;

    const orderAmount = subtotal.toFixed(1);
    const orderSet = await orderModal.create({
      userId: req.session.login,
      orderAmount: orderAmount,
      deliveryAdress: user.addressId,
      peyment: req.body.peyment,
      deliveryAdress: {
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
      const coupenRemove = await userSchema.findOneAndUpdate(
        { _id: user._id },
        { $pull: { coupens: { ID: id } } }
      );
    }

    if (req.body.peyment == "wallet") {
      const ne = 0 - subtotal.toFixed(1);
      const debitAmount = ne * -1;
      await wallet.findOneAndUpdate(
        { userId: req.session.login },
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
        let product = await productModal.findOne({ _id: e.productId });
        let newstock = product.stock - e.quantity;
        let pr = await productModal.findOneAndUpdate(
          { _id: e.productId },
          { $set: { stock: newstock } }
        );
      });

      const removeCart = await cartModal.updateOne(
        { userId: req.session.login },
        { $unset: { products: 1 } }
      );
      if (removeCart) {
        req.session.succes = true;
        res.redirect("/success");
      } else {

      }
    } else {
      res.send("irs note");
    }
  } catch (err) {
    console.log(err.message + "    postSucces");
  }
};

//order det page rendering
const orderDetails = async (req, res) => {
  try {
    const category = await categoryModal.find({ isDeleted: false });
    const order = await orderModal
      .find({ userId: req.session.login })
      .sort({ orderDate: -1 });
    const ordercount = await orderModal
      .find({ userId: req.session.login }).countDocuments();
    
      const cartCount = await getCartCount(req.session.login);
      const wishlistCount = await getWishlistCount(req.session.login)
    if (order) {
      res.render("user/orderDet", {
        login: req.session.login,
        order,
        category,
        ordercount,
        cartCount,
        wishlistCount
      });
    } else {
      res.render("user/orderDet", { login: req.session.login, category });
    }
  } catch (err) {
    console.log(err.message + " orderdet page rendering ");
  }
};

// order view details page
const orderView = async (req, res) => {
  try {   
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid order ID');
    }

    const category = await categoryModal.find({ isDeleted: false });

    const order = await orderModal
      .findOne({ _id: req.params.id })
      .populate("OrderedItems.productId");
    
      const cartCount = await getCartCount(req.session.login);
    const wishlistCount = await getWishlistCount(req.session.login)
    
    res.render("user/order", { login: req.session.login, order, category ,wishlistCount,cartCount});
  } catch (err) {
    console.log(err.message + "      ORDER VIEW PAGE RENDERING ");
  }
};

//editOrder
const cancelOrder = async (req, res) => {
  try {
    const cancelReason = req.body.cancelReason;
    const orderId = req.body.orderId;

    console.log(orderId)
    
    const newOne = await orderModal.findOneAndUpdate(
      { userId: req.body.user, "OrderedItems.productId": req.body.id , _id: req.body.orderId},
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
        const k = await orderModal.findOneAndUpdate(
          { _id: newOne._id },
          { $set: { orderStatus: "canceled" } },
          { new: true } 
        );
        
      } else {
        let flag = newOne.OrderedItems.filter(
          (e) => e.orderProStatus === "canceled"
        ).length;

        if (flag === newOne.OrderedItems.length) {
          const k = await orderModal.findOneAndUpdate(
            { _id: newOne._id },
            { $set: { orderStatus: "canceled" } },
            { new: true } 
          );
          
        }
      }

      if (newOne.peyment != "cod") {
        await wallet.findOneAndUpdate(
          { userId: req.body.user },
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

// return order

const returnOrder = async (req, res) => {
    
  try {

      const { proId, ordId, price, reason } = req.body;
      
      const returnMsg = await orderModal.findOneAndUpdate({ _id: ordId, 'OrderedItems.productId': proId }, {

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

const razor = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const amount = req.body.amount * 100;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: process.env.RAZORPAY_EMAIL,
    };
    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          succes: true,
          msg: "ORDER created!",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_IDKEY,
          name: user.name,
          email: user.email,
        });
      } else {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err.message + "    razorpay route");
  }
};

//invoice
const invoice = async (req, res) => {
  try {
    if (req.params.id) {
      const uuidb = uuid();
      const orderDta = await orderModal
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

const walletHistory = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const walletOld = await wallet
      .find({ userId: req.session.login })
      .skip(skip)
      .limit(limit);
    const le = await wallet.findOne({ userId: req.session.login });
    const trancount = le.length;

    const totalPages = Math.ceil(trancount / limit);   
    if (walletOld.length != 0 && totalPages < page) {
      res.redirect(`/walletHistory`);
    }
    const category = await categoryModal.find({
      isDeleted: false, 
      listed: true,
    });
    const walletData =
      (await wallet.findOne({ userId: req.session.login })) || [];
    
      const cartCount = await getCartCount(req.session.login);
      const wishlistCount = await getWishlistCount(req.session.login)
    res.render("user/walletHistory", {
      login: req.session.login,
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

const reviewPost = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const product = await productModal.findOne({ _id: req.params.proId });

    const user = await userSchema.findOne({ _id: req.session.login });
    const newReview = await reviews.create({
      reviews: review,
      ratings: rating,
      userId: user._id,
      productId: product._id,
    });

    if (newReview) {
      res.redirect("/order");
    } else {
      res.status(404).send("review not added");
    }
  } catch (err) {
    console.log(err.message + " reviews post");
  }
};


const razorFailure = async(req,res)=>{
  try {
      const offer = req.session.offer || 0;
      const user = await userSchema.findOne({ _id: req.session.login });
      const cart = await cartModal.findOne({ userId: req.session.login });
      const subtotal = cart.TotalPrice;
  
      const orderAmount = subtotal.toFixed(1);
      const orderSet = await orderModal.create({
        userId: req.session.login,
        orderAmount: orderAmount,
        deliveryAdress: user.addressId,
        peyment: req.body.peyment,
        deliveryAdress: {
          name: req.body.name,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
        },
        orderDate: new Date(),
        coupen: offer,
        orderStatus: 'payment pending',
        OrderedItems: cart.products.map((e) => ({
          productId: e.productId,
          quantity: e.quantity,
          price: e.price,
          orderProStatus: 'payment pending' 
        })),
      });

      await cartModal.updateOne(
        { userId: req.session.login },
        { $unset: { products: 1 } }
      );

        res.redirect('/order');

  } catch (error) {
      console.error(error.message)
  }
}

const failedPaymentRetry = async(req,res)=>{
  try {
      const currentSessionId = req.session.login;

      const CurrentUser = await userSchema.findOne({_id:currentSessionId});

      const amount = req.body.amount * 100
          const options = {
              amount: amount,
              currency: "INR",
              receipt: process.env.RAZORPAY_EMAIL
          }
          instance.orders.create(options, (err, order) => {
              if (!err) {
                  res.send({
                      succes: true,
                      msg: 'ORDER created',
                      order_id: order.id,
                      amount: amount,
                      key_id: process.env.RAZORPAY_IDKEY,
                      name: CurrentUser.name,
                      email: CurrentUser.email
                  })
              } else {
                  console.error("Error creating order:", err);
                  res.status(500).send({ success: false, msg: "Failed to create order" });
              }
            })
  } catch (error) {
      console.error(error.message + "failed payment retry")
  }
}

const changeStatusRetry = async (req, res) => {
  
  try {
      const orderId = req.body.ordId;
    const changeStatus = await orderModal.findOneAndUpdate({ _id: orderId }, { $set: { 'OrderedItems.$[].orderProStatus': 'pending', orderStatus: 'pending' } });
    
      if(changeStatus){
          res.send({success:true})
      }
      
  } catch (error) {
      console.error(error.message)
  }
}


module.exports = {
  checkoutPage,
  postSucces,
  success,
  orderView,
  orderDetails,
  cancelOrder,
  returnOrder,
  razor,
  invoice,
  walletHistory,
  reviewPost,
  razorFailure,
  failedPaymentRetry,
  changeStatusRetry
};
