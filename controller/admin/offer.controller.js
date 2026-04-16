const Offer = require("../../models/offer");
const Product = require("../../models/products");
const Category = require("../../models/catagory");

/**
 * @desc Get Offers Page
 */
const getOffers  = async (req, res) => {
  try {
    const offer = await Offer.find({});
    res.render("admin/offer", {
      admin: req.session.admin,
      offer,
      offers: true,
    });
  } catch (err) {
    console.log(err.message + "  offer page");
  }
};

/**
 * @desc Render Create Offer Page
 */
const getCreateOfferPage  = async (req, res) => {
  try {
    res.render("admin/addOffer", {
      admin: req.session.admin,
      creat: "offers",
      offers: true,
    });
  } catch (err) {}
};

/**
 * @desc Create Offer 
 */
const createOffer = async (req, res) => {
  try {
    const offerCreate = await Offer.create({
      name: req.body.name,
      offer: req.body.offer,
    });
    if (offerCreate) {
      res.redirect("/admin/offers");
    } else {
      res.send("Something issue there. offer didn't created");
    }
  } catch (err) {
    console.log(err.message + " offer creating");
  }
};

/**
 * @desc Render Edit Offer Page
 */
const getEditOfferPage = async (req, res) => {
  try {
    const data = await Offer.findOne({ _id: req.params.id });
    res.render("admin/addOffer", {
      admin: req.session.admin,
      edit: "offers/edit",
      data,
      id: data._id,
      offers: true,
    });
  } catch (err) {
    console.log(err.message + "offer Edit page");
  }
};

/**
 * @desc Update Offer
 */
const updateOffer = async (req, res) => {
  try {
    const { name, offer } = req.body;
    const data = await Offer.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { name, offer } }
    );
    res.redirect("/admin/offers");
  } catch (err) {
    console.log(err.message + "getofferEdit");
  }
};

/**
 * @desc Delete Offer
 */
const deleteOffer = async (req, res) => {
  try {
    const products = await Product.find({ offer: req.params.id });
    products.forEach(async (e) => {
      await Product.findOneAndUpdate(
        { _id: e._id },
        { $unset: { offer: "" }, $set: { price: e.actualPrice } }
      );
    });
    const done = await Offer.findOneAndDelete({ _id: req.params.id });
    res.redirect("/admin/offers");
  } catch (err) {
    console.log(err.message + "offer Remove");
  }
};

/**
 * @desc Get Offer Products
 */
const getOfferProducts = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalProductsCount = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProductsCount / limit);
    
    const offer = await Offer.findOne({ _id: req.params.id });
    const product = await Product.find({}).skip(skip).limit(limit);

    res.render("admin/offerProduct", {
      admin: req.session.admin,
      product,
      id: req.params.id,
      offer: offer.offer,
      offers: true,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.log(err.message + "offer product");
  }
};

/**
 * @desc Get Offer Category
 */
const getOfferCategory = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalCatCount = await Category.countDocuments({});
    const totalPages = Math.ceil(totalCatCount / limit);

    const offer = await Offer.findOne({ _id: req.params.id });
    const category = await Category.find({}).skip(skip).limit(limit);

    res.render("admin/offerCategory", {
      admin: req.session.admin,
      category,
      id: req.params.id,
      offer: offer.offer,
      offers: true,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.log(err.message + "offer product");
  }
};

/**
 * @desc Toggle Product Offer
 */
const toggleProductOffer  = async (req, res) => {
  try {
    await Offer.findOne({ _id: req.params.id });
    if (req.body.add) {
      const data = await Product.findOne({ _id: req.body.id });
      const offerPrice = ((data.price / 100) * (100 - req.body.offer)).toFixed(
        2
      );
      await Product.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { offer: req.params.id, price: offerPrice } }
      );
    } else {
      const data = await Product.findOne({ _id: req.body.id });
      await Product.findOneAndUpdate(
        { _id: req.body.id },
        { $unset: { offer: 1 }, $set: { price: data.actualPrice } }
      );
    }
  } catch (err) {
    console.log(err.message + "offerProductAdd");
  }
};

/**
 * @desc Toggle Category Offer
 */
const toggleCategoryOffer = async (req, res) => {
  try {
    const { id: categoryId, offer, add } = req.body;
    const offerPercentage = parseInt(req.body.offer);

    const products = await Product.find({ category: categoryId });
    await Offer.findOne({ _id: req.params.catId });

    if (req.body.add) {

      for (const product of products) {
        const offerPrice = product.price - (product.price * offerPercentage) / 100;
        await Product.findByIdAndUpdate(product._id, { $set: { offer: req.params.catId, price: offerPrice } });
      }

      await Category.findOneAndUpdate({_id: categoryId},{$set:{isOffer: true}})
      
    } else {

      for (const product of products) {
        await Product.findByIdAndUpdate(product._id, { $unset: { offer: 1 }, $set: { price: product.actualPrice } });
      }
      await Category.findOneAndUpdate({_id: categoryId},{$set:{isOffer: false}})
     
    }
  } catch (err) {
    console.log(err.message + "offerCatAdd");
  }
};

module.exports = {
  getOffers,
  getCreateOfferPage,
  createOffer,
  getEditOfferPage,
  updateOffer,
  deleteOffer,
  getOfferProducts,
  getOfferCategory,
  toggleProductOffer,
  toggleCategoryOffer,
};