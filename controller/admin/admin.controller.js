const User = require("../../models/userSchema");
const Product = require("../../models/products");
const Order = require("../../models/orders");

/**
 * @desc    Get Admin Dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const orderList1 = await Order
      .find({orderStatus: { $ne: "payment pending" }})
      .sort({ _id: -1 })
      .populate("userId")
      .limit(10);

    const productCount = await Product.find({});
    const userCount = await User.find({ is_admin: false}).sort({ date: -1 });
    const recentUser = userCount.slice(0, 3);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const startDate = new Date(currentDate.getFullYear(), currentMonth);
    const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
    const month = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$peyment",
          sale: { $sum: "$orderAmount" },
        },
      },
    ]);
    const monthSale = month.reduce((acc, val) => acc + val.sale, 0);
    const orderList = await Order.aggregate([
      {
        $group: {
          _id: "$peyment",
          totalAmount: { $sum: "$orderAmount" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const op = await Order
      .find({ peyment: "online peyment", orderStatus: { $ne: "payment pending" } })
      .sort({ _id: -1 })
      .limit(1);
    const cod = await Order
      .find({ peyment: "cod" })
      .sort({ _id: -1 })
      .limit(1);
    let count = 0;
    orderList.forEach((e) => {
      count += e.totalCount;
    });

    const most = await Order.aggregate([
      {
        $unwind: "$OrderedItems",
      },
      {
        $group: {
          _id: "$OrderedItems.productId",
          totalCount: { $sum: "$OrderedItems.quantity" },
          orderDates: { $push: "$orderDate" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $sort: { totalCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    const daily = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          totalAmount: { $sum: "$orderAmount" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayOrders = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: todayStart,
            $lte: todayEnd,
          },
          orderStatus: { $ne: "payment pending" },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$orderAmount" },
        },
      },
    ]);
    const dailyIncome = todayOrders[0] ? todayOrders[0].totalAmount : 0;

    const yearly = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const topTenCategory = await Order.aggregate([
      {
        $unwind: "$OrderedItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "OrderedItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $lookup: {
          from: "catgories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: {
            productId: "$OrderedItems.productId",
            productName: "$productData.name",
            categoryId: "$productData.category",
            categoryName: "$categoryData.name",
          },
          productQuantity: { $sum: "$OrderedItems.quantity" },
        },
      },
      {
        $sort: { productQuantity: -1 },
      },
      {
        $group: {
          _id: "$_id.categoryId",
          categoryName: { $first: "$_id.categoryName" },
          topProduct: { $first: "$_id.productId" },
          topProductName: { $first: "$_id.productName" },
          totalProducts: { $sum: "$productQuantity" },
        },
      },
      {
        $sort: { totalProducts: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.render("admin/dashboard", {
      admin: req.session.admin,
      home: "home",
      most,
      orderList,
      count,
      op,
      cod,
      monthSale,
      daily,
      dailyIncome,
      yearly,
      userCount,
      productCount,
      orderList1,
      recentUser,
      topTenCategory,
    });
  } catch (err) {
    console.log(err.message + "     admin first route");
  }
};

/**
 * @desc    Get Payment Summary
 */
const getPaymentSummary  = async (req, res) => {
  try {
    const orderList = await Order.aggregate([
      {
        $group: {
          _id: "$peyment",
          totalAmount: { $sum: "$orderAmount" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    let count = 0;
    orderList.forEach((e) => {
      count += e.totalCount;
    });
    res.send({ orderList, count });
  } catch (err) {
    console.log(err.message + "    peyment fetching ");
  }
};

module.exports = {
  getDashboard,
  getPaymentSummary,
};
