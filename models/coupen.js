const mongoose = require('mongoose');

const coupenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    offer: {type: Number, required: true},
    ID: { type: String, required: true },
    image: { type: String }
});

module.exports = mongoose.model('coupen', coupenSchema)