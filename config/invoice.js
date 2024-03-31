const fs = require("fs");
const easyinvoice = require("easyinvoice");
const dotEnv = require('dotenv');

const data = (det) => {
  const products = det.OrderedItems.map((e, i) => {
    return {
      description: e.productId.name,
      quantity: e.quantity,
      price: e.productId.price,
      total: e.price,
    };
  });

  const obj = {
    apiKey: process.env.INVOICE_API_KEY,
    images: {
      logo: "",
    },
    sender: {
      company: "Soundwave",
      state: "kerala",
      zip: 871976,
      city: "kochi",
      country: "india",
    },
    client: {
      company: det.userId.name,
      address: det.deliveryAdress.name,
      zip: det.deliveryAdress.pincode,
      city: det.deliveryAdress.city,
      state: det.deliveryAdress.state,
      country: "india",
    },
    information: {
      number: det._id,
      date: det.orderDate,
    },
    products: products,
    bottomNotice: "thank you for purchasing",
    settings: {
      currency: "USD",
    },
    translate: {},
  };

  return obj;
};

module.exports = data;
