const mongoose = require('mongoose');

const wishlist = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{
        productId: { type: mongoose.SchemaTypes.ObjectId,  ref:'Product', }, 
        quantity: {
            type: Number,
          
            required: true,
            default: 1,
        },
        price: {
            type: Number,
            required: true,
        },
      
    }],
  
    
})

module.exports = mongoose.model('wishlist', wishlist)