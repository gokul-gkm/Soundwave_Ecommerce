const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    offer: { type: Number, required: true}
})

module.exports = mongoose.model('offer', offerSchema);