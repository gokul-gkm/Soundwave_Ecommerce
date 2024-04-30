const mongoose = require('mongoose');

const order = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    
    orderAmount: { type: Number, required: true },

    deliveryAdress: {
        name:{type:String,required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    
    peyment: { type: String },
     
    orderDate: { type: Date, required: true, default: Date.now },

    coupen: {type: Number},
    
    orderStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled','returned', 'payment pending'], default: 'pending' },
    
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

        canceled: { type: Boolean, default: false },
        orderProStatus: { type: String, enum: ['shipped', 'delivered', 'canceled','returned','payment pending'], default: 'shipped' },
        cancelReason: { type: String, default: '' },
        returnReason:{type: String, default: ''},
        returned: { type: Boolean, default: false }
    }],

})



module.exports = mongoose.model('orders', order)

