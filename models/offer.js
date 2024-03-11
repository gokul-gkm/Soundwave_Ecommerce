const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: { type: String, requied: true },
    offer: { type: Number, requied: true}
})

module.exports = mongoose.model('offer', offerSchema);