const Order = require('../../models/orders');
const Product = require('../../models/products');
const Wallet = require('../../models/wallet');

/**
 * @desc Get Orders
 */
const getOrders = async (req, res) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalOrderCount = await Order.countDocuments({});
        const totalPages = Math.ceil(totalOrderCount / limit);
        console.log(skip + " "+page)
        const orderList = await Order.find({ orderStatus: { $ne: "payment pending" } })
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

/**
 * @desc Get Order by ID
 */
const getOrderById = async (req, res) => {
    try {
        if (req.params.id) {
            const orderList = await Order.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId')
            res.render('admin/order', { admin: req.session.admin, order: true, orderList ,ordId:req.params.id})
        } else {
            res.redirect('admin/orders')
        }
    } catch (err) {
        console.log(err.message + '     order view ')
    }
}

/**
 * @desc Remove Order Item
 */
const removeOrderItem = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const removeorder = await Order.findByIdAndUpdate(
            { _id: orderId },
            { $pull: { OrderedItems: { productId: productId } } }
        );
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}

/**
 * @desc Delete Entire Order
 */ 
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const removeorder = await Order.findByIdAndDelete({ _id: orderId })
        console.log(removeorder)
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}

/**
 * @desc Update Order Item Status
 */
const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        await Order.findOneAndUpdate(
            { _id: orderId, 'OrderedItems.productId': productId },
            { $set: { 'OrderedItems.$.orderProStatus': req.body.val } }
        );
        updateOrderStatus(orderId);
        
        res.json({ success: true });
    } catch (err) {
        console.log(err.message + ' orderProstatus');
        res.status(500).json({ success: false, error: err.message });
    }
}

/**
 * @desc Update Order Status (Helper)
 */
const updateOrderStatus = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        const orderProStatusValues = order.OrderedItems.map(item => item.orderProStatus);

        let newOrderStatus;
        if (orderProStatusValues.every(status => status === 'delivered')) {
            newOrderStatus = 'delivered';
        } else if (orderProStatusValues.every(status => status === 'shipped')) {
            newOrderStatus = 'shipped';
        } else if (orderProStatusValues.every(status => status === 'canceled')) {
            newOrderStatus = 'canceled';
        }else if (orderProStatusValues.every(status => status === 'returned')) {
            newOrderStatus = 'returned';
        } 
        else {
            newOrderStatus = 'pending';
        }

        order.orderStatus = newOrderStatus;
        await order.save();
    } catch (err) {
        console.log(err.message + ' updateOrderStatus');
    }
}

/**
 * @desc Handle Return Request
 */
const handleReturnRequest = async (req, res) => {

    try {
        const ordId = req.params.orderId;
        const findReturnOrd = await Order.find({ _id: ordId, "OrderedItems.returned": true });

        for (const ordData of findReturnOrd) {
            const userIdd = ordData.userId;
            for (const element of ordData.OrderedItems) {
                if (element.returned) {
                    await Order.findOneAndUpdate(                
                        { _id: ordId, "OrderedItems.productId": element.productId },                  
                        { $set: { "OrderedItems.$.orderProStatus": "returned" } },                  
                        { new: true }                  
                    );                 

                    const findOrder = await Order.findOne(                 
                        {
                            _id: ordId,
                            "OrderedItems.productId": element.productId,
                            "OrderedItems.returned": true,              
                        },
                        { "OrderedItems.$": 1 }               
                    );
                   
                    if (findOrder) {     
                        const findStock = element.quantity;
                        await Product.findOneAndUpdate(                       
                           { _id: element.productId },
                            { $inc: { stock: findStock } }
                        );     
                        const moneyDecreses = element.price;   
                        
                        const money = await Order.findOne({ _id: ordId, "OrderedItems.productId": element.productId });  
                        
                        await Order.findOneAndUpdate(
                            { _id: ordId, "OrderedItems.productId": element.productId },     
                            { $inc: { orderAmount: -moneyDecreses } }    
                        );
                        
                    };

                };

                if (element.returned && ordId.peyment !== 'Cash on Delivery') {     
                    await Wallet.findOneAndUpdate(
                        { userId: userIdd },
                        {
                            $inc: { amount: element.price },
                            $push: {
                                transaction:
                                {
                                    amount: element.price,
                                    creditOrDebit: 'credit',
                                    source: "refund from returned order ",
                                    orderId: ordId
                                }
                            }
                        },
                        { new: true, upsert: true }
                    );                
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    getOrders,
    getOrderById,
    removeOrderItem,
    deleteOrder,
    updateOrderItemStatus,
    handleReturnRequest
}