const userSchema = require("../models/userSchema");
const categoryModal = require("../models/catagory");
const addressModal = require("../models/adress");
const cartModal = require("../models/cart");
const productModal = require("../models/products");
const orderModal = require("../models/orders");
const wallet = require("../models/wallet");
const reviews = require("../models/reviews");
const Razorpay = require('razorpay');
const { order } = require("./adminOrderController");

const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require("path");
const invoiceConfig = require('../config/invoice');

require('dotenv').config();
const { RAZORPAY_IDKEY, RAZORPAY_SECRET_KEY } = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_IDKEY,
  key_secret: RAZORPAY_SECRET_KEY
})

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
    try {
      const category = await categoryModal.find({listed: true, isDeleted: false});
      const coupenOffer = req.session.offer || 0;
      const user = await userSchema.findOne({ _id: req.session.login });
      const cart = await cartModal
        .findOne({ userId: req.session.login })
        .populate("products.productId");
      
      const nonBlockedProduct = cart.products.filter((e) => e.productId.listed)
      
      const BlockedProduct = cart.products.filter((e) => !e.productId.listed)
      for (const el of BlockedProduct) {
        if (!el.productId.listed) {

            const doc = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $pull: { products: { productId: el.productId._id } } }, { new: true });
        }
      }
      
      const total1 = nonBlockedProduct.reduce((acc, product) => acc + product.price, 0);
      const total = Number(total1.toFixed(1))
      const wallet1 = await wallet.findOne({ userId: req.session.login })
        const walletAmount = wallet1?.amount || 0;
      let add;
      const adress = await addressModal.findOne({ userId: req.session.login });
      const totalPriceAdding = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $set: { TotalPrice: total } }, { new: true }).populate('products.productId').exec()
      if (adress) {
        const add = adress?.address.find(e => e._id + 'hh' == user.addressId + 'hh');

        // adress.address.forEach((e) => {
        //   if (e._id + "hh" == user.addressId + "hh") {
        //     add = e;
        //   } else {
        //   }
        // });
        res.render("client/checkout", {
          login: req.session.login,
          add,
          cart: totalPriceAdding,
          category,
          coupenOffer,
          walletAmount
        });
      } else {
        res.render("client/checkout", {
          login: req.session.login,
          cart: totalPriceAdding,
          category,
          coupenOffer,
          walletAmount
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
      console.log(req.body.peyment);
      const offer = req.session.offer || 0;
      const user = await userSchema.findOne({ _id: req.session.login });
      const cart = await cartModal.findOne({ userId: req.session.login });
      const subtotal = cart.TotalPrice / 100 * (100 - offer)
      const orderAmount = subtotal.toFixed(1)
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
        OrderedItems: cart.products.map((e) => ({
          productId: e.productId,
          quantity: e.quantity,
          price: e.price,
        })),
      });

      if (req.session.offer && req.session.coupenId) {

        const hh = req.session.coupenId.trim()
        const id = String(hh)
        const coupenRemove = await userSchema.findOneAndUpdate({ _id: user._id }, { $pull: { coupens: { ID: id } } })

    }

      if (req.body.peyment == 'wallet') {
        const ne = 0 - subtotal.toFixed(1)
        const debitAMount = ne * (-1)
        await wallet.findOneAndUpdate({ userId: req.session.login }, { $inc: { amount: ne }, $push: { transaction: { amount: debitAMount, creditOrDebit: 'debit' } } })
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
          // await orderModal.updateOne({ $set: { orderStatus: 'payment pending' } });
          // res.redirect("/order?paymentFailed=true");
          // res.send("Payment failed. Please try again later.")
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
      
      const demo = await orderModal.findOne({ userId: req.body.user, 'OrderedItems.productId': req.body.id });

      
          const newOne = await orderModal.findOneAndUpdate({ userId: req.body.user, 'OrderedItems.productId': req.body.id },
              {
                  $set: {
                  'OrderedItems.$.canceled':true,
                  'OrderedItems.$.orderProStatus':'canceled'
                  }
              }
        )
        
       
        if (newOne) {

          if (newOne.OrderedItems.length == 1) {
            const k = await orderModal.findOneAndUpdate({ _id: newOne._id }, { $set: { orderStatus: 'canceled' } })
            

        } else {
            let flag = newOne.OrderedItems.filter(e => e.orderProStatus === 'canceled').length;

            if (flag === newOne.OrderedItems.length) {
                const k = await orderModal.findOneAndUpdate({ _id: newOne._id }, { $set: { orderStatus: 'canceled' } })
              
            }
          }

          
         
          if (newOne.peyment != 'cod') {
          
            await wallet.findOneAndUpdate({ userId: req.body.user }, { $inc: { amount: req.body.price }, $push: { transaction: { amount: req.body.price, creditOrDebit: 'credit' } } }, { new: true, upsert: true });
           
          }
          

            
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


//invoice
const invoice = async (req, res) => {
  try {
      if (req.params.id) {
          const uuidb = uuid()
          const orderDta = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId');
          
          const inv = invoiceConfig(orderDta)         
          const result = await easyinvoice.createInvoice(inv);        
          const filePath = path.join(__dirname, '../public/files', `invoice_${uuidb}.pdf`);
          await fs.writeFileSync(filePath, result.pdf, 'base64');
      
          res.download(filePath, `invoice_${uuidb}.pdf`, (err) => {
              console.log("invoice download");
              if (!err) {
                  fs.unlinkSync(filePath);

              } else {
                  console.error(err);
              }
          });
      } else {
          res.status(404).send('Invoice ID not provided');
      }

  } catch (err) {    
      console.log(err.message + "invoice" )   
  }
}

const walletHistory = async (req, res) => {
  try {
      const perPage = 5;
      const page = req.query.page || 1;
      const walletOld = await wallet.find({ userId: req.session.login }).skip((perPage * page) - perPage)
          .limit(perPage);;

      const le = await wallet.find({ userId: req.session.login });
      const totalPages = Math.ceil(le.length / 5)
      if (walletOld.length != 0 && totalPages < page) {
          
          res.redirect(`/walletHistory`)
      }
      const category = await categoryModal.find({isDeleted: false, listed: true})
      const walletData = await wallet.findOne({ userId: req.session.login }) || []
      res.render('client/walletHistory', { login: req.session.login, category, wallet: walletData, le: le.length, totalPages, currentPage: page })
  } catch (err) {
      console.log(err.message + 'wallet history')
      res.status(400).send({ err: err.message })
  }
}

const reviewPost = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const product = await productModal.findOne({_id: req.params.proId})

    const user = await userSchema.findOne({_id: req.session.login})
  const newReview = await reviews.create({
    reviews: review,
    ratings: rating,
    userId: user._id,
    productId: product._id
  })

  if (newReview) {
    res.redirect('/order')
  } else {
    res.status(404).send("review not added")
  }
  } catch (err) {
    console.log(err.message+ " reviews post");
  }
  
}
  
  module.exports = {
    checkoutPage,
    postSucces,
    success,
    orderView,
    orderDet,
    editOrder, 
    razor,
    invoice,
    walletHistory,
    reviewPost
};
