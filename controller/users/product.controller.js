const Category = require("../../models/catagory");
const Product = require("../../models/products");
const reviews = require("../../models/reviews");
const { getWishlistCount ,getCartCount} = require('../../utils/count');

/**
 * @desc    Get All Products
 * @route   GET /products
 */
const getProducts = async (req, res) => {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.product_search;
    const sortOption = req.query.sortby || "newArrivals";
    const userId = req.session.login;
  
    try {
      const category = await Category.find({
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
  
      const totalProductsCount = await Product.countDocuments(query);
  
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
  
      const Allproduct = await Product
        .find(query)
        .populate("category")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
      
  
      if (userId) {
        const cartCount = await getCartCount(userId);
        const wishlistCount = await getWishlistCount(userId)
        res.render("user/shop", {
          login: userId,
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
  
  /**
   * @desc    Get Products by Category
   * @route   GET /products/category
  */
  const getProductsByCategory = async (req, res) => {
    try {
      const catName = req.query.catName;
      const limit = 4;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
  
      const category = await Category.find({
        isDeleted: false,
        listed: true,
      });
  
      const categoryObj = await Category.findOne({ name: catName });
  
      const catProducts = await Product
        .find({
          stock: { $gt: 0 },
          listed: true,
          category: categoryObj._id,
          isDeleted: false,
        })
        .skip(skip)
        .limit(limit)
        .exec();
  
      const totalProductsCount = await Product.countDocuments({
        stock: { $gt: 0 },
        listed: true,
        category: categoryObj._id,
        isDeleted: false,
      });
  
      const totalPages = Math.ceil(totalProductsCount / limit);
        const userId = req.session.login;
      if (userId) {
        const cartCount = await getCartCount(userId);
        const wishlistCount = await getWishlistCount(userId)
        res.render("user/category", {
          login: userId,
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
  
/**
 * @desc    Get Product Details
 *  @route   GET /product/:id
 */
const getProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;
      if (productId) {
        const category = await Category.find({
          isDeleted: false,
          listed: true,
        });
  
        const review = await reviews
          .find({ productId })
          .populate("userId")
          .populate("productId");
  
        const likeproduct = await Product
          .find({ stock: { $gt: 0 }, listed: true })
          .populate("category");
        const userId = req.session.login;
        if (userId) {
          const cartCount = await getCartCount(userId);
          const wishlistCount = await getWishlistCount(userId)
          const productDet = await Product
            .findOne({ _id: productId })
            .populate("category");
  
          res.render("user/productDet", {
            login: userId,
            productDet,
            category,
            review,
            likeproduct,
            cartCount,
            wishlistCount
          });
        } else {
          const productDet = await Product
            .findOne({ _id: productId })
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
  
/**
 * @desc    Filter Products
 * @route   POST /products/filter
 */
const filterProducts = async (req, res) => {
    try {
       const selectedCategories = req.body.categories;
       const selectedColors = req.body.colors;
       const page = parseInt(req.body.page) || 1; 
       const limit = parseInt(req.body.limit) || 4;
       const userId = req.session.login;
   
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
   
       const filteredProducts = await Product.find(query)
         .skip(skip)
         .limit(limit);
  
       const totalProductsCount = await Product.countDocuments(query);
       const totalPages = Math.ceil(totalProductsCount / limit);
       const cartCount = await getCartCount(userId);
       const wishlistCount = await getWishlistCount(userId);
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
    getProducts,
    getProductsByCategory,
    getProductDetails,
    filterProducts,
  };