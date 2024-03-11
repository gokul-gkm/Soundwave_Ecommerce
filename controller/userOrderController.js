const userSchema = require("../models/userSchema");
const categoryModal = require("../models/catagory");
const addressModal = require("../models/adress");
const cartModal = require("../models/cart");
const productModal = require("../models/products");
const orderModal = require("../models/orders");
const Razorpay = require('razorpay');
const { order } = require("./adminOrderController");

require('dotenv').config();
const { RAZORPAY_IDKEY, RAZORPAY_SECRET_KEY } = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_IDKEY,
  key_secret: RAZORPAY_SECRET_KEY
})

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
    try {
      const category = await categoryModal.find({});
      const user = await userSchema.findOne({ _id: req.session.login });
      const cart = await cartModal
        .findOne({ userId: req.session.login })
        .populate("products.productId");
  
      let add;
      const adress = await addressModal.findOne({ userId: req.session.login });
      if (adress) {
        adress.address.forEach((e) => {
          if (e._id + "hh" == user.addressId + "hh") {
            add = e;
          } else {
          }
        });
        res.render("client/checkout", {
          login: req.session.login,
          add,
          cart,
          category,
        });
      } else {
        res.render("client/checkout", {
          login: req.session.login,
          cart,
          category,
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
      if (req.session.succes) {
        delete req.session.succes;
  
        res.render("client/succes", { login: req.session.login, category });
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
      const user = await userSchema.findOne({ _id: req.session.login });
      const cart = await cartModal.findOne({ userId: req.session.login });
      const orderSet = await orderModal.create({
        userId: req.session.login,
        orderAmount: cart.TotalPrice,
        deliveryAdress: user.addressId,
        peyment: req.body.peyment,
        deliveryAdress: {
          name: req.body.name,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
        },
        orderDate: new Date(),
        OrderedItems: cart.products.map((e) => ({
          productId: e.productId,
          quantity: e.quantity,
          price: e.price,
        })),
      });
  
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
  const orderDet = async (req, res) => {
      try {
          const category = await categoryModal.find({ isDeleted: false });
          const order = await orderModal.find({ userId: req.session.login }).sort({ orderDate: -1 });
          if (order) {
              res.render('client/orderDet', { login: req.session.login, order ,category})
          } else {
              res.render('client/orderDet', { login: req.session.login , category})
          }
  
  
      } catch (err) {
          console.log(err.message + '     order det pag erendering ')
      }
  }
  
  // order view details page 
  const orderView = async (req, res) => {
      try {
          const category = await categoryModal.find({ isDeleted: false });
          const order = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId');
          res.render('client/order', { login: req.session.login, order , category})
      } catch (err) {
          console.log(err.message + '      ORDER VIEW PAGE RENDERING ')
      }
  }
  
  //editOrder
  const editOrder = async (req, res) => {
      try {
          const newOne = await orderModal.findOneAndUpdate({ userId: req.body.user, 'OrderedItems.productId': req.body.id },
              {
                  $set: {
                  'OrderedItems.$.canceled':true,
                  'OrderedItems.$.orderProStatus':'canceled'
                  }
              }
          )
          if(newOne){
              res.send({set:true})
          }else{
              res.send({issue:true})
  
          }
      } catch (err) {
          console.log(err.message + ' /editOrder')
      }
}
  
const razor = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId })
    const amount = req.body.amount * 100;
    const options = {
      amount : amount,
      currency: 'INR',
      receipt: process.env.RAZORPAY_EMAIL
    }
    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          succes: true,
          msg: 'ORDER created!',
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_IDKEY,
          name: user.name,
          email: user.email
        })
      } else {
        console.log(err);
      }
    })
    
  } catch (err) {
    console.log(err.message + '    razorpay route');
  }
}

  
  module.exports = {
    checkoutPage,
    postSucces,
    success,
    orderView,
    orderDet,
    editOrder, 
    razor
};
