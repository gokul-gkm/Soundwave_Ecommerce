const userSchema = require("../models/userSchema");
const categoryModal = require("../models/catagory");
const addressModal = require("../models/adress");
const cartModal = require("../models/cart");
const productModal = require("../models/products");
const orderModal = require("../models/orders");
const nodemailer = require("nodemailer");
const bycrypt = require("bcrypt");
require("dotenv").config();

const e = require("express");

const { check, validationResult } = require("express-validator");


// functions
const generateOTP = () => {
  const otpNumber = Math.floor(1000 + Math.random() * 9000);
  return otpNumber;
};

const verifyemail = async (name, email, otp) => {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailoption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "for verification mail",
      html: `<h1>hi ${name} this is the soundwave verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`,
    };
    transport.sendMail(mailoption, (err, info) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(`Email has been sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (pass) => {
  try {
    const passwordHash = await bycrypt.hash(pass, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};

// date setup
const options = { day: "2-digit", month: "short", year: "numeric" };
//end

// routing controllers

const home = async (req, res) => {
  const limit = 4;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const category = await categoryModal.find({isDeleted:false});

    const totalProductsCount = await productModal.countDocuments({
      stock: { $gt: 0 },
      listed: true,
    });

    const totalPages = Math.ceil(totalProductsCount / limit);

    const Allproduct = await productModal
      .find({ stock: { $gt: 0 }, listed: true })
      .populate("category")
      .skip(skip)
      .limit(limit);

    if (req.session.login) {
      res.render("client/home", {
        login: req.session.login,
        category,
        Allproduct,
        currentPage: page,
        totalPages,
      });
    } else {
      res.render("client/home", {
        category,
        Allproduct,
        currentPage: page,
        totalPages,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const about = (req, res) => {
  res.render("client/about");
};

//sign-up page rendering
const signUp = (req, res) => {
  if (req.session.login) {
    res.redirect("/");
  } else if (req.session.error) {
    const error = req.session.error;
    req.session.error = undefined;
    console.log(error);
    res.render("client/login", { error: error, activeTab: "signup" });
  } else if (req.session.err1) {
    const err = req.session.err1;
    req.session.err1 = undefined;
    res.render("client/login", { err1: err, activeTab: "signin" });
  } else if (req.session.err2) {
    const err = req.session.err2;
    req.session.err2 = undefined;
    res.render("client/login", { err2: err, activeTab: "signin" });
  } else if (req.session.otp) {
    console.log(req.session.otp);
    res.redirect("/otp");
  } else {
    res.render("client/login", { activeTab: "signin" });
  }
};

//email exist checking
const emailExist = async (req, res) => {
  try {
    console.log(req.body.payload);
    let emailcheck = await userSchema.findOne({ email: req.body.payload });

    if (emailcheck) {
      res.send({ emailExist: "email exist already" });
    } else {
      res.send({ note: "email not exist " });
    }
  } catch (err) {
    console.log(err.message + "          email checking route");
  }
};

// getting signup page detailes
const getSignUp = async (req, res) => {

  try {
    const validationRules = [
      check("registerName", "name must be greater than 3+ characters")
        .trim()
        .isLength({ min: 3 }),
      check("registerEmail", "enter a valid email").trim().isEmail(),
      check("registerPassword", "password must be 3+ characters")
        .trim()
        .isLength({ min: 3 }),
      check("registerConfirmPassword", "passwords do not match").custom(
        (value, { req }) => {
          if (value !== req.body.registerPassword) {
            throw new Error("Passwords do not match");
          }
          return true;
        }
      ),
    ];

    // Execute validation middleware
    await Promise.all(validationRules.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array();
      console.log(req.session.error);
      return res.redirect("/login");
    }

    const sp = await securePassword(req.body.registerPassword);
    const userData = new userSchema({
      name: req.body.registerName,
      email: req.body.registerEmail,
      password: sp,
    });
    const noUser = await userSchema.findOne({ email: req.body.registerEmail });

    if (noUser) {
      console.log("There is already a user with this email");
    } else {
      req.session.userData = userData;
      req.session.otp = generateOTP();

      verifyemail(
        req.body.registerName,
        req.body.registerEmail,
        req.session.otp
      );
      return res.redirect("/otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//otp page rendering
const otp = async (req, res) => {
  try {

    if (req.session.otp) {

      if (req.session.wrong) {

        res.render("client/otp", { message: req.session.wrong });

      } else if (req.session.resend) {

        res.render("client/otp", { resend: req.session.resend });

      } else {

        res.render("client/otp");
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "    otp");
  }
};

const gettingOtp = async (req, res) => {
  try {
    const otp = req.body.otp;

    if (req.session.otp && req.session.forget) {
      if (Number(otp.join("")) === req.session.otp) {
        const currentDate = new Date();
        req.session.otp = undefined;
        res.redirect("/newPass");
        console.log(req.session.otp);
      } else {
        req.session.wrong = true;
        res.redirect("/otp");
      }
    } else {
      if (Number(otp.join("")) === req.session.otp) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", options);

        const userData = new userSchema({
          name: req.session.userData.name,
          email: req.session.userData.email,
          password: req.session.userData.password,
          date: formattedDate,
        });

        const userSave = await userData.save();

        if (userSave) {
          req.session.login = userSave._id;
          req.session.otp = undefined;
          req.session.wrong = undefined;
          res.redirect("/profile");
        } else {
          res.send("somthing is issue");
        }
      } else {
        req.session.wrong = true;
        res.redirect("/otp");
      }
    }
  } catch (err) {
    console.log(err + "       otp routing");
  }
};

//resubmit email id and password
const resubmit = async (req, res) => {
  try {
    req.session.forget = undefined;
    req.session.otp = undefined;
    res.redirect("/login");
  } catch (err) {
    console.log(err.message + "    resbmit Route");
  }
};

//resend
const resend = async (req, res) => {
  try {
    if (req.session.wrong) {
      req.session.wrong = null;
    }
    if (req.session.otp) {
      req.session.otp = generateOTP();
      verifyemail(
        req.body.registerName,
        req.body.registerEmail,
        req.session.otp
      );
      req.session.resend = "check yor email , i have send that";
      res.redirect("/otp");
      req.session.resend = undefined;
    } else {
      res.redirect("/login");
    }
  } catch (er) {
    console.log(er.message + "       resend route");
  }
};

//forget password
const forgetPassword = async (req, res) => {
  try {
    if (!req.session.otp) {
      res.render("client/forgetPassword");
    } else {
      res.redirect("/otp");
    }
  } catch (er) {
    console.log(er.message + "        forget Password wrong ");
  }
};

//forget email exist or not fetching data
const forgetemailExist = async (req, res) => {
  try {
    const userData = await userSchema.findOne({
      email: req.body.payload,
      is_block: false,
    });
    if (!userData) {
      res.send({ emailExist: "hello" });
    } else {
      res.send({ note: "hello" });
    }
  } catch (err) {
    console.log(err.message + "       forgetemailExist route");
  }
};

//get forget email
const forget = async (req, res) => {
  try {
    req.session.forget = req.body.email;
    req.session.otp = generateOTP();
    const user = await userSchema.findOne({ email: req.session.forget });
    verifyemail(user.name, user.email, req.session.otp);
    res.redirect("/otp");
  } catch (err) {
    console.log(err.message + "       forget gatting route");
  }
};

//geting new pass and the update that
const getNewPass = async (req, res) => {
  try {
    const sp = await securePassword(req.body.password);
    if (req.session.login) {
      const changePass = await userSchema.updateOne(
        { _id: req.session.login },
        { $set: { password: sp } }
      );
      if (changePass) {
        res.redirect("/profile?passwordChanged=true");
      } else {
        console.log("something change pass not work");
      }
    }
    const updatPass = await userSchema.updateOne(
      { email: req.session.forget },
      { $set: { password: sp } }
    );
    if (updatPass) {
      req.session.forget = undefined;
      res.redirect("/login");
    } else {
      console.log("something new pass not work");
    }
  } catch (err) {
    console.log(err.message + "         get new pass route");
  }
};

//new password page rendering
const newPass = async (req, res) => {
  try {
    if (req.session.forget) {
      res.render("client/newPass");
    } else if (req.session.login) {
      res.render("client/newPass");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "          newpass route");
  }
};

//geting login dets
const getLogin = async (req, res) => {
  try {
    const user = await userSchema.findOne({
      email: req.body.email,
      is_block: false,
      isDeleted: false,
    });

    if (user) {
      const passMatch = await bycrypt.compare(req.body.password, user.password);
      if (passMatch) {
        req.session.login = user._id;
        res.redirect("/profile");
      } else {
        req.session.err2 = "password is wrong";
        res.redirect("/login");
      }
    } else {
      req.session.err1 = " email is not exist";
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "       get login route errr");
  }
};

const products = async (req, res) => {
  const limit = 4;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.product_search; 
  const sortOption = req.query.sortby || 'newArrivals'; 

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
          query.name = { $regex: new RegExp(searchQuery, 'i') }; 
      }

      const totalProductsCount = await productModal.countDocuments(query);

      const totalPages = Math.ceil(totalProductsCount / limit);

      let sortCriteria = {};

      switch (sortOption) {
          case 'priceLowToHigh':
              sortCriteria = { price: 1 };
              break;
          case 'priceHighToLow':
              sortCriteria = { price: -1 };
              break;
          case 'averageRating':
              sortCriteria = { averageRating: -1 };
              break;
          case 'featured':
              sortCriteria = { featured: -1 };
              break;
          case 'popularity':
              sortCriteria = { popularity: -1 };
              break;
          case 'aToZ':
              sortCriteria = { name: 1 };
              break;
          case 'zToA':
              sortCriteria = { name: -1 };
              break;
          default:
              sortCriteria = { createdAt: -1 }; 
              break;
      }

      const Allproduct = await productModal
          .find(query)
          .populate('category')
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit);

      if (req.session.login) {
          res.render('client/shop', {
              login: req.session.login,
              Allproduct,
              category,
              currentPage: page,
              totalPages,
              totalProductsCount,
              limit,
              sortby: sortOption,
          });
      } else {
          res.render('client/shop', {
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
      console.log(err.message + '        shop route');
  }
};


const category = async (req, res) => {
  try {
    const catName = req.query.catName;
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const category = await categoryModal.find({});

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
      res.render("client/category", {
        login: req.session.login,
        catProduct: catProducts,
        category: category,
        categoryName: categoryObj.name,
        currentPage: page,
        totalPages,
        totalProductsCount,
        limit,
      });
    } else {
      res.render("client/category", {
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

//profile get method
const profile = async (req, res) => {
  try {
    if (req.query.passwordChanged === 'true') {
      res.locals.passwordChangedAlert = 'Your password has been changed successfully.';
    }

    const category = await categoryModal.find({isDeleted: false, listed: true});

    const user = await userSchema.findOne({ _id: req.session.login });

    if (user.is_admin === 0) {
      res.render("client/profile", {
        user,
        login: req.session.login,
        category,
      });
    } else {
      req.session.admin = user;
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err.message + "         profile route");
  }
};

//product details get method
const productDets = async (req, res) => {
  try {
    if (req.query.proId) {
      const category = await categoryModal.find({});

      if (req.session.login) {
        const productDet = await productModal
          .findOne({ _id: req.query.proId })
          .populate("category");

        res.render("client/productDet", {
          login: req.session.login,
          productDet,
          category,
        });
      } else {
        const productDet = await productModal
          .findOne({ _id: req.query.proId })
          .populate("category");

        res.render("client/productDet", { productDet, category });
      }
    } else {
      res.redirect("/products");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//wishlist get method
const wishlist = async (req, res) => {
  try {
    const category = await categoryModal.find({});
    res.render("client/wishlist", { login: req.session.login, category });
  } catch (err) {
    console.log(err.message + "      wishList page route");
  }
};

//logout
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.send("Error");
      } else {
        res.redirect("/");
      }
    });
  } catch (err) {
    console.log(err.message + "         logout route");
  }
};


module.exports = {
    signUp,
    getSignUp,
    home,
    otp,
    gettingOtp,
    products,
    category,
    emailExist,
    getLogin,
    profile,
    about,
    resubmit,
    resend,
    forgetPassword,
    forgetemailExist,
    forget,
    newPass,
    getNewPass,
    logout,
    productDets,
    wishlist,
};
