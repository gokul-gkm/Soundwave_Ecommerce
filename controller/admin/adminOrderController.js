const orderModal = require('../../models/orders');
const productModal = require('../../models/products');
const wallet = require('../../models/wallet');

//order 
const order = async (req, res) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalOrderCount = await orderModal.countDocuments({});
        const totalPages = Math.ceil(totalOrderCount / limit);
        console.log(skip + " "+page)
        const orderList = await orderModal.find({ orderStatus: { $ne: "payment pending" } })
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
            res.render('admin/order', { admin: req.session.admin, order: true, orderList ,ordId:req.params.id})
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

const returnManaging = async (req, res) => {

    try {

        const ordId = req.query.id

        const findReturnOrd = await orderModal.find({ _id: ordId, "OrderedItems.returned": true });

    

        for (const ordData of findReturnOrd) {

            const userIdd = ordData.userId;     //  UserId

            for (const element of ordData.OrderedItems) {

                if (element.returned) {

                    await orderModal.findOneAndUpdate(
                  
                        { _id: ordId, "OrderedItems.productId": element.productId },
                    
                        { $set: { "OrderedItems.$.orderProStatus": "returned" } },
                    
                        { new: true }
                    
                    );
                    
                  

                    const findOrder = await orderModal.findOne(
                  
                        {
                            _id: ordId,
                            "OrderedItems.productId": element.productId,
                            "OrderedItems.returned": true,
                      
                        },

                        { "OrderedItems.$": 1 }
                    
                    );
                   
                    if (findOrder) {
                      
                        const findStock = element.quantity;

                        await productModal.findOneAndUpdate(
                        
                            { _id: element.productId },

                            { $inc: { stock: findStock } }

                        );

                      
      
                        const moneyDecreses = element.price;
                        
                        const money = await orderModal.findOne({ _id: ordId, "OrderedItems.productId": element.productId })
                    
                        await orderModal.findOneAndUpdate(
      
                            { _id: ordId, "OrderedItems.productId": element.productId },
      
                            { $inc: { orderAmount: -moneyDecreses } }
      
                        );
                        
                    };

                };

                if (element.returned && ordId.peyment !== 'Cash on Delivery') {
                
                    await wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { amount: element.price }, $push: { transaction: { amount: element.price, creditOrDebit: 'credit', source: "refund from returned order ", orderId: ordId } } }, { new: true, upsert: true });
                
                }
            }

        }

    } catch (error) {

        console.log(error.message);

    }

};


module.exports = {
    order,
    removeorder,
    orderView,
    removeordeFull,
    orderProstatus,
    returnManaging
}