const categoryModal = require("../../models/catagory");
const productModal = require("../../models/products");
const reviews = require("../../models/reviews");
const { getWishlistCount ,getCartCount} = require('../../utils/count');

const products = async (req, res) => {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.product_search;
    const sortOption = req.query.sortby || "newArrivals";
  
    try {
      const category = await categoryModal.find({
        isDeleted: false,
        listed: true,
      });
  
      const categoryIds = category.map((category) => category._id);
  
      let query = {
        stock: { $gt: 0 },
        listed: true,
        isDeleted: false,
        category: { $in: categoryIds },
      };
  
      if (searchQuery) {
        query.name = { $regex: new RegExp(searchQuery, "i") };
      }
  
      const totalProductsCount = await productModal.countDocuments(query);
  
      const totalPages = Math.ceil(totalProductsCount / limit);
  
      let sortCriteria = {};
  
      switch (sortOption) {
        case "priceLowToHigh":
          sortCriteria = { price: 1 };
          break;
        case "priceHighToLow":
          sortCriteria = { price: -1 };
          break;
        case "averageRating":
          sortCriteria = { averageRating: -1 };
          break;
        case "featured":
          sortCriteria = { featured: -1 };
          break;
        case "popularity":
          sortCriteria = { popularity: -1 };
          break;
        case "aToZ":
          sortCriteria = { name: 1 };
          break;
        case "zToA":
          sortCriteria = { name: -1 };
          break;
        default:
          sortCriteria = { createdAt: -1 };
          break;
      }
  
      const Allproduct = await productModal
        .find(query)
        .populate("category")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
      
  
      if (req.session.login) {
        const cartCount = await getCartCount(req.session.login);
        const wishlistCount = await getWishlistCount(req.session.login)
        res.render("user/shop", {
          login: req.session.login,
          Allproduct,
          category,
          currentPage: page,
          totalPages,
          totalProductsCount,
          limit,
          sortby: sortOption,
          cartCount,
          wishlistCount
        });
      } else {
        res.render("user/shop", {
          Allproduct,
          category,
          currentPage: page,
          totalPages,
          totalProductsCount,
          limit,
          sortby: sortOption,
        });
      }
    } catch (err) {
      console.log(err.message + "        shop route");
    }
  };
  
  const category = async (req, res) => {
    try {
      const catName = req.query.catName;
      const limit = 4;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
  
      const category = await categoryModal.find({
        isDeleted: false,
        listed: true,
      });
  
      const categoryObj = await categoryModal.findOne({ name: catName });
  
      const catProducts = await productModal
        .find({
          stock: { $gt: 0 },
          listed: true,
          category: categoryObj._id,
          isDeleted: false,
        })
        .skip(skip)
        .limit(limit)
        .exec();
  
      const totalProductsCount = await productModal.countDocuments({
        stock: { $gt: 0 },
        listed: true,
        category: categoryObj._id,
        isDeleted: false,
      });
  
      const totalPages = Math.ceil(totalProductsCount / limit);
  
      if (req.session.login) {
        const cartCount = await getCartCount(req.session.login);
        const wishlistCount = await getWishlistCount(req.session.login)
        res.render("user/category", {
          login: req.session.login,
          catProduct: catProducts,
          category: category,
          categoryName: categoryObj.name,
          currentPage: page,
          totalPages,
          totalProductsCount,
          limit,
          cartCount,
          wishlistCount
        });
      } else {
        res.render("user/category", {
          catProduct: catProducts,
          category: category,
          categoryName: categoryObj.name,
          currentPage: page,
          totalPages,
          totalProductsCount,
          limit,
        });
      }
    } catch (err) {
      console.log(err.message + "        category route");
    }
};
  
const productDets = async (req, res) => {
    try {
      if (req.query.proId) {
        const category = await categoryModal.find({
          isDeleted: false,
          listed: true,
        });
  
        const review = await reviews
          .find({ productId: req.query.proId })
          .populate("userId")
          .populate("productId");
  
        const likeproduct = await productModal
          .find({ stock: { $gt: 0 }, listed: true })
          .populate("category");
  
        if (req.session.login) {
          const cartCount = await getCartCount(req.session.login);
          const wishlistCount = await getWishlistCount(req.session.login)
          const productDet = await productModal
            .findOne({ _id: req.query.proId })
            .populate("category");
  
          res.render("user/productDet", {
            login: req.session.login,
            productDet,
            category,
            review,
            likeproduct,
            cartCount,
            wishlistCount
          });
        } else {
          const productDet = await productModal
            .findOne({ _id: req.query.proId })
            .populate("category");
  
          res.render("user/productDet", {
            productDet,
            category,
            review,
            likeproduct,
          });
        }
      } else {
        res.redirect("/products");
      }
    } catch (err) {
      console.log(err.message);
    }
};
  
const filterProducts = async (req, res) => {
    try {
       const selectedCategories = req.body.categories;
       const selectedColors = req.body.colors;
       const page = parseInt(req.body.page) || 1; 
       const limit = parseInt(req.body.limit) || 4; 
  
   
       let query = {
         stock: { $gt: 0 },
         listed: true,
         isDeleted: false,
       };
   
       if (selectedCategories && selectedCategories.length > 0) {
         query.category = { $in: selectedCategories };
       }
   
       if (selectedColors && selectedColors.length > 0) {
         query.color = { $in: selectedColors };
       }
   
       const skip = (page - 1) * limit;
   
       const filteredProducts = await productModal.find(query)
         .skip(skip)
         .limit(limit);
  
       const totalProductsCount = await productModal.countDocuments(query);
       const totalPages = Math.ceil(totalProductsCount / limit);
       const cartCount = await getCartCount(req.session.login);
        const wishlistCount = await getWishlistCount(req.session.login)
       res.status(200).json({
         products:filteredProducts,
         page,
         totalPages,
         totalProductsCount,
         filteredProducts,
         cartCount,
         wishlistCount
       });
    } catch (error) {
       console.error("Error filtering products:", error);
       res.status(500).json({ message: "Internal Server Error" });
    }
};
  
module.exports = {
    products,
    category,
    productDets,
    filterProducts,
  };