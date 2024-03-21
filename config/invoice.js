const fs = require("fs");
const easyinvoice = require("easyinvoice");

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
    apiKey: "jLMfRq3EFKqfYKHQ7IEImhL5SeFPDkv9On8IkVWv8zxW8LojwLbZaZzM08o8jdXK",
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
