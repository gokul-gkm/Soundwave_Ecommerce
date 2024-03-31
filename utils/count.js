const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const wishlistModel = require('../models/wishlist');
const cartModal = require('../models/cart');

async function getWishlistCount(userId) {
    const userIdObjectId = new ObjectId(userId);
    const wishlist = await wishlistModel.findOne({ userId: userIdObjectId }).populate("products.productId");
    return wishlist ? wishlist.products.length : 0;
}

async function getCartCount(userId) {
    const userIdObjectId = new ObjectId(userId);
    const cart = await cartModal.findOne({ userId: userIdObjectId }).populate("products.productId");
    return cart ? cart.products.reduce((total, product) => total + product.quantity, 0) : 0;
}

module.exports = { getWishlistCount ,getCartCount};