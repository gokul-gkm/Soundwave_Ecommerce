const mongoose = require('mongoose');

const order = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,required: true, ref: 'user' },
    orderAmount: { type: Number, required: true },
    deliveryAdress: {
        name:{type:String,required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
     },
     peyment:{type:String},
    orderDate: { type: Date, required: true, default:  Date.now },
    orderStatus: { type: String,enum: ['pending', 'shipped', 'delivered','canceled'], default: 'pending'},
    OrderedItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        price: {
            type: Number,
            required: true,
        },
        canceled:{type:Boolean,default:false},
        orderProStatus: { type: String, enum: ['shipped', 'delivered','canceled'], default: 'shipped' }
    }],

})

// order.pre('save', function(next) {
//     const allProStatus = this.OrderedItems.map(item => item.orderProStatus);

//     if (allProStatus.every(status => status === 'delivered')) {
//         this.orderStatus = 'delivered';
//     } else if (allProStatus.every(status => status === 'shipped')) {
//         this.orderStatus = 'shipped';
//     } else if (allProStatus.every(status => status === 'cancelled')) {
//         this.orderStatus = 'cancelled';
//     } else {
//         this.orderStatus = 'pending';
//     }

//     next();
// });

module.exports = mongoose.model('orders', order)

