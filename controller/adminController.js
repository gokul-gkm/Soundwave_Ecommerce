const userSchema = require("../models/userSchema");
const productModal = require('../models/products');
const orderModal = require('../models/orders')

//admin page rendering
const adminPage = async (req, res) => {
    try {
        const orderList1 = await orderModal.find({}).sort({ _id: -1 }).populate('userId').limit(10);
        
        const productCount = await productModal.find({})
        const userCount = await userSchema.find({}).sort({ date: -1 });
        const recentUser = userCount.slice(0, 3)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const startDate = new Date(currentDate.getFullYear(), currentMonth);
        const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
        const month = await orderModal.aggregate([{
            $match: {
                orderDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }, {
            $group: {
                _id: '$peyment',
                sale: { $sum: '$orderAmount' }
            }
        }
        ])
        const monthSale = month.reduce((acc, val) => acc + val.sale, 0)
        const orderList = await orderModal.aggregate([{
            $group: {
                _id: '$peyment',
                totalAmount: { $sum: '$orderAmount' },
                totalCount: { $sum: 1 }
            }
        }])

        const op = await orderModal.find({ peyment: 'online peyment' }).sort({ _id: -1 }).limit(1)
        const cod = await orderModal.find({ peyment: 'cod' }).sort({ _id: -1 }).limit(1)
        let count = 0;
        orderList.forEach(e => {
            count += e.totalCount;
        })

        const most = await orderModal.aggregate([
            {
                $unwind: '$OrderedItems'
            },
            {
                $group: {
                    _id: '$OrderedItems.productId',
                    totalCount: { $sum: '$OrderedItems.quantity' },
                    orderDates: { $push: '$orderDate' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $sort: { totalCount: -1 }
            }, {
                $limit: 5
            }

        ])
        const daily = await orderModal.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                    totalAmount: { $sum: '$orderAmount' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
        const yearly = await orderModal.aggregate([
            {
                $group: {
                    _id: { $year: '$orderDate' },
                    totalAmount: { $sum: '$orderAmount' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
      
        const topTenCategory = await orderModal.aggregate([
            {
                $unwind: '$OrderedItems'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'OrderedItems.productId',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: '$productData'
            },
            {
                $lookup: {
                    from: 'catgories',
                    localField: 'productData.category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $unwind: '$categoryData'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'OrderedItems.productId',
                    foreignField: '_id',
                    as: 'orderedProduct'
                }
            },
            {
                $unwind: '$orderedProduct'
            },
            {
                $group: {
                    _id: {
                        categoryId: '$productData.category',
                        categoryName: '$categoryData.name',
                        productId: '$orderedProduct._id',
                        productName: '$orderedProduct.name'
                    },
                    totalProducts: { $sum: '$OrderedItems.quantity' }
                }
            },
            {
                $sort: { totalProducts: -1 }
            },
            {
                $group: {
                    _id: '$_id.categoryId',
                    categoryName: { $first: '$_id.categoryName' },
                    topProduct: { $first: '$_id.productId' },
                    topProductName: { $first: '$_id.productName' },
                    totalProducts: { $first: '$totalProducts' }
                }
            },
            {
                $limit: 10 
            }
        ]);

        res.render('admin/dashboard', { admin: req.session.admin, home: 'home', most, orderList, count, op, cod, monthSale, daily, yearly, userCount, productCount, orderList1, recentUser , topTenCategory})
    } catch (err) {
        console.log(err.message + '     admin first route');
    }
}


//peyment chart fetching 
const peyment = async (req, res) => {
    try {
        const orderList = await orderModal.aggregate([{
            $group: {
                _id: '$peyment',
                totalAmount: { $sum: '$orderAmount' },
                totalCount: { $sum: 1 }
            }
        }])


        let count = 0;
        orderList.forEach(e => {
            count += e.totalCount;
        })
        res.send({ orderList, count })
    } catch (err) {
        console.log(err.message + '    peyment fetching ')
    }
}


module.exports = {
    adminPage,
    peyment,
}