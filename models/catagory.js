const mongoose = require('mongoose');

const category= new mongoose.Schema({
    name: { type: String, required: true,unique:true },
    listed: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isOffer: {type: Boolean,default: false}
})

module.exports=mongoose.model('catgory',category)