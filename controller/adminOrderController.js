const orderModal = require('../models/orders');

//order 
const order = async (req, res) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalOrderCount = await orderModal.countDocuments({});
        const totalPages = Math.ceil(totalOrderCount / limit);

        const orderList = await orderModal.find({})
            .populate('userId')
            .skip(skip)
            .limit(limit)
            .sort({ orderDate: -1 });

        if (orderList) {
            res.render('admin/orderDets', { admin: req.session.admin, order: true, orderList , totalPages, currentPage: page})
        }
    } catch (err) {
        console.log(err.message + '   admin order page rendering route ')
    }
}

//order view
const orderView = async (req, res) => {
    try {
        if (req.params.id) {
            const orderList = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId')
            res.render('admin/order', { admin: req.session.admin, order: true, orderList })
        } else {
            res.redirect('admin/orders')
        }
    } catch (err) {
        console.log(err.message + '     order view ')
    }
}

//remove order product
const removeorder = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndUpdate({ _id: req.body.id }, { $pull: { OrderedItems: { productId: req.body.pro } } })
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}

//remove order 
const removeordeFull = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndDelete({ _id: req.body.id })
        console.log(removeorder)
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}


const orderProstatus = async (req, res) => {
    try {
        
        await orderModal.findOneAndUpdate(
            { _id: req.body.id, 'OrderedItems.productId': req.body.proId },
            { $set: { 'OrderedItems.$.orderProStatus': req.body.val } }
        );
        updateOrderStatus(req.body.id);
        
        res.json({ success: true });
    } catch (err) {
        console.log(err.message + ' orderProstatus');
        res.status(500).json({ success: false, error: err.message });
    }
}


const updateOrderStatus = async (orderId) => {
    try {
        const order = await orderModal.findById(orderId);
        const orderProStatusValues = order.OrderedItems.map(item => item.orderProStatus);

        let newOrderStatus;
        if (orderProStatusValues.every(status => status === 'delivered')) {
            newOrderStatus = 'delivered';
        } else if (orderProStatusValues.every(status => status === 'shipped')) {
            newOrderStatus = 'shipped';
        } else if (orderProStatusValues.every(status => status === 'canceled')) {
            newOrderStatus = 'canceled';
        } else {
            newOrderStatus = 'pending';
        }

        order.orderStatus = newOrderStatus;
        await order.save();
    } catch (err) {
        console.log(err.message + ' updateOrderStatus');
    }
}


module.exports = {
    order,
    removeorder,
    orderView,
    removeordeFull,
    orderProstatus,
}