const User = require("../../models/userSchema");
const Cart = require("../../models/cart");
const Order = require("../../models/orders");
const Razorpay = require("razorpay");


require("dotenv").config();
const { RAZORPAY_IDKEY, RAZORPAY_SECRET_KEY } = process.env;

const instance = new Razorpay({
  key_id: RAZORPAY_IDKEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

/**
 * @desc    Create Razorpay Order
 * @route   POST /payments/razorpay
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
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

/**
 * @desc    Handle Payment Failure
 * @route   POST /payments/failure
 */
const handlePaymentFailure = async(req,res)=>{
    try {
      const userId = req.session.login;
      const offer = req.session.offer || 0;
      const user = await User.findOne({ _id: userId});
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
        orderStatus: 'payment pending',
        OrderedItems: cart.products.map((e) => ({
          productId: e.productId,
          quantity: e.quantity,
          price: e.price,
          orderProStatus: 'payment pending' 
        })),
      });

      await Cart.updateOne(
        { userId},
        { $unset: { products: 1 } }
      );

        res.redirect('/order');

  } catch (error) {
      console.error(error.message)
  }
}

/**
 * @desc    Retry Failed Payment
 * @route   POST /payments/retry
 */
const retryPayment = async(req,res)=>{
  try {
      const currentSessionId = req.session.login;

      const CurrentUser = await User.findOne({_id:currentSessionId});

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

/**
 * @desc    Update Order Status After Retry
 * @route   POST /payments/retry-status
 */
const updateRetryStatus = async (req, res) => {
  
  try {
      const orderId = req.body.ordId;
    const changeStatus = await Order.findOneAndUpdate({ _id: orderId }, { $set: { 'OrderedItems.$[].orderProStatus': 'pending', orderStatus: 'pending' } });
    
      if(changeStatus){
          res.send({success:true})
      }
      
  } catch (error) {
      console.error(error.message)
  }
}


module.exports = {
  createRazorpayOrder,
  handlePaymentFailure,
  retryPayment,
  updateRetryStatus,
};