const orderModal = require("../../models/orders");

//year chart fetching
const year = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const year = await orderModal.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(`${currentYear - 5}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $year: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.send({ year });
  } catch (err) {
    console.log(err.message + "    year fetching ");
  }
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//monthly chart

const monthlySales = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const monthlyData = await orderModal.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const salesData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find((item) => item._id === i + 1);
      return monthData ? monthData.totalAmount : 0;
    });

    res.json({ months: monthNames, salesData });
  } catch (err) {
    console.error("Error fetching monthly sales data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching monthly sales data." });
  }
};

module.exports = {
  year,
  monthlySales,
};
