const { StatusCodes } = require("http-status-codes");
const categoryModel = require("../../models/catagory");
const productModel = require("../../models/products");
const { getCartCount, getWishlistCount } = require("../../utils/count");

/**
 * @desc    Home Page
 */
const homePage = async (req, res, next) => {
  const limit = 4;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  try {
    const category = await categoryModel.find({ isDeleted: false, listed: true }); 

    const totalProductsCount = await productModel.countDocuments({
      stock: { $gt: 0 },
      listed: true,
    });

    const totalPages = Math.ceil(totalProductsCount / limit);

    const Allproduct = await productModel
      .find({ stock: { $gt: 0 }, listed: true })
      .populate("category")
      .skip(skip)
      .limit(limit);
      
    const catCount = await productModel.aggregate([
      {
         $group: {
           _id: "$category", 
           count: { $sum: 1 } 
         }
      },
      {
         $lookup: {
           from: "catgories", 
           localField: "_id", 
           foreignField: "_id", 
           as: "categoryDetails" 
         }
      },
      {
         $unwind: "$categoryDetails" 
      },
      {
         $project: {
           _id: 0, 
           categoryName: "$categoryDetails.name", 
           count: 1 
         }
      }
     ])
    
    if (req.session.login) {
      const cartCount = await getCartCount(req.session.login);
      const wishlistCount = await getWishlistCount(req.session.login)
      console.log(cartCount);
      res.render("user/home", {
        login: req.session.login,
        category,
        Allproduct,
        currentPage: page,
        totalPages,
        cartCount,
        wishlistCount,
        catCount
      });
    } else {
      res.render("user/home", {
        category,
        Allproduct,
        currentPage: page,
        totalPages,
        catCount   
      });
    }

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
    next(error);
  }
};

/**
 * @desc    About Page
 */
const aboutPage = async (req, res, next) => {
  try {
    const categories = await categoryModel.find({ isDeleted: false, listed: true });
    res.render("user/about", { category: categories });
  } catch (error) {
    next(error)
  }
};

/**
 * @desc    404 Page
 */
const notFoundPage = async (req, res) => {
  try {
      const category = await categoryModel.find({ isDeleted: false, listed: true });
      if (req.session.login) {
          res.render('user/404', { login: req.session.login , category})
      }
      else {
          res.render('user/404',{category})
      }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send({ faild: true })
  }
};

module.exports = {
  homePage,
  aboutPage,
  notFoundPage
};