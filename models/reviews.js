const mongoose = require('mongoose');

const reviews = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    reviews: { type: String, required: true },
    ratings: { type: Number, required: true },
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true}
})

module.exports = mongoose.model('reviews', reviews)