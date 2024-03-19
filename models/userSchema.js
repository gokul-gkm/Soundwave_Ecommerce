const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:{type: String, unique: true},
  img: { type: String },
  date:{type:String},
  addressId:{ type: mongoose.Schema.Types.ObjectId, ref:'addr'},
  is_admin: { type: Number, required: true, default: 0 },
  is_block: { type: Boolean, required: true, default: false },
  isDeleted: { type: Boolean, default: false },
  coupens:[{
    ID:{type:String},
    coupenId: { type: mongoose.Schema.Types.ObjectId,  ref:'coupen' },
  }],
  
});

module.exports = mongoose.model('user', userSchema)