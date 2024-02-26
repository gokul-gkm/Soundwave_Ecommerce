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
    // Define validation rules
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
  const searchQuery = req.query.product_search; // Get the search query from request
  const sortOption = req.query.sortby || 'newArrivals'; // Get the sorting option from request

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


// const products = async (req, res) => {
//   const limit = 4;
//   const page = parseInt(req.query.page) || 1;
//   const skip = (page - 1) * limit;
//   const searchQuery = req.query.product_search; // Get the search query from request

//   try {
//       const category = await categoryModal.find({
//           isDeleted: false,
//           listed: true,
//       });
    
//       const categoryIds = category.map((category) => category._id);

//       let query = {
//           stock: { $gt: 0 },
//           listed: true,
//           isDeleted: false,
//           category: { $in: categoryIds },
//       };

//       if (searchQuery) {
//           query.name = { $regex: new RegExp(searchQuery, 'i') }; // Case-insensitive search
//       }

//       const totalProductsCount = await productModal.countDocuments(query);

//       const totalPages = Math.ceil(totalProductsCount / limit);

      

//       const Allproduct = await productModal
//           .find(query)
//           .populate('category')
//           .skip(skip)
//           .limit(limit);

//       if (req.session.login) {
//           res.render('client/shop', {
//               login: req.session.login,
//               Allproduct,
//               category,
//               currentPage: page,
//               totalPages,
//               totalProductsCount,
//               limit,
//           });
//       } else {
//           res.render('client/shop', {
//               Allproduct,
//               category,
//               currentPage: page,
//               totalPages,
//               totalProductsCount,
//               limit,
//           });
//       }
//   } catch (err) {
//       console.log(err.message + '        shop route');
//   }
// };


// Route to handle category

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

//profile
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

//product dets get method
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

//adress
const adress = async (req, res) => {
    try {
      const user = await userSchema.findOne({ _id: req.session.login });
      const category = await categoryModal.find({});
  
      if (user.is_admin === 0) {
        const adress = await addressModal.findOne({ userId: req.session.login });
        if (adress) {
        }
  
        res.render("client/adress", {
          user,
          login: req.session.login,
          adress,
          category,
        });
      } else {
        req.session.admin = user;
        res.redirect("/admin");
      }
    } catch (err) {
      console.log(err.message + "   adress route");
    }
  };
  
  //get address
  const getadress = async (req, res) => {
    try {
      const exits = await addressModal.findOne({
        userId: req.query.id,
        address: { $elemMatch: { name: req.body.name } },
      });
      if (!exits) {
        const update = {
          $set: { userId: req.query.id },
          $addToSet: {
            address: {
              name: req.body.name,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        };
        const options = {
          upsert: true,
          new: true,
        };
  
        const newAdress = await addressModal.findOneAndUpdate(
          { userId: req.query.id },
          update,
          options
        );
        if (newAdress) {
          res.redirect("/adress");
        } else {
          res.send("address didnt find");
        }
      } else {
      }
    } catch (err) {
      console.log(err.message + "    get addresss route");
    }
  };
  
  // patchaddress
  const patchaddress = async (req, res) => {
    try {
      const exists = await addressModal.findOne({
        userId: req.body.id,
        address: { $elemMatch: { name: req.body.val } },
      });
      if (exists) {
        res.send({ exists });
      } else {
        res.send({ note: "note" });
      }
    } catch (err) {
      console.log(err.message + "    gpatch addresss route");
    }
  };
  
  //remove address
  const removeadress = async (req, res) => {
    try {
      const remove = await addressModal.updateOne(
        { userId: req.body.uid },
        { $pull: { address: { _id: req.body.id } } }
      );
  
      if (remove.modifiedCount === 0) {
        console.log("address not removed");
      } else {
        res.send({ remove });
      }
    } catch (err) {
      console.log(err.message + "   remove addresss");
    }
  };
  
  // changing deafualt addres in user schema in in fetching
  const Defaddress = async (req, res) => {
    try {
      const added = await userSchema.findOneAndUpdate(
        { _id: req.body.uid },
        { $set: { addressId: req.body.id } },
        { new: true }
      );
      if (added) {
        res.send({ done: added });
      } else {
        res.send({ done: "not added" });
      }
    } catch (err) {
      console.log(err.message + "        Defaddress route ");
    }
  };

//cart
const cart = async (req, res) => {
  try {
    const cart = await cartModal
      .findOne({ userId: req.session.login })
      .populate("products.productId");

    console.log(cart);
    if (cart) {
      const total = cart.products.reduce(
        (acc, product) => acc + product.price,
        0
      );
      const options = {
        upsert: true,
        new: true,
      };
      const totalPriceAdding = await cartModal
        .findOneAndUpdate(
          { userId: req.session.login },
          { $set: { TotalPrice: total } },
          options
        )
        .exec();
      const category = await categoryModal.find({});
      res.render("client/cart", {
        login: req.session.login,
        cart,
        totalprice: totalPriceAdding.TotalPrice,
        category,
      });
    } else {
      const category = await categoryModal.find({});
      res.render("client/cart", {
        login: req.session.login,
        totalprice: 0,
        category,
      });
    }
  } catch (err) {
    console.log(err.message + "      cart page route");
  }
};

// add cart fetching
const addcart = async (req, res) => {
  try {
    const product = await productModal.findOne({ _id: req.body.id });
    const result = await cartModal
      .findOne({
        userId: req.body.user,
        products: {
          $elemMatch: {
            productId: req.body.id,
          },
        },
      })
      .exec();
    if (!result) {
      const tp = product.price * req.body.q;

      const filter = { userId: req.body.user };
      const update = {
        $set: {
          userId: req.body.user,
        },
        $addToSet: {
          products: { productId: req.body.id, price: tp },
        },
      };
      const options = {
        upsert: true,
        new: true,
      };

      const cartSuccess = await cartModal
        .findOneAndUpdate(filter, update, options)
        .exec();

      if (cartSuccess) {
        res.send({ success: "succes" });
      }
    } else {
      res.send({ exist: "it is already exist" });
    }
  } catch (err) {
    console.log(err.message + "      addCart put fecth routre");
  }
};

// add cart on post requiset
const addcartPost = async (req, res) => {
  try {
    if (req.query.user) {
      const product = await productModal.findOne({ _id: req.query.id });
      const result = await cartModal
        .findOne({
          userId: req.query.user,
          products: {
            $elemMatch: {
              productId: req.query.id,
            },
          },
        })
        .exec();
     
      if (!result) {
        
        const tp = product.price * req.body.q;

        const filter = { userId: req.query.user };
        const update = {
          $set: {
            userId: req.query.user,
          },
          $addToSet: {
            products: {
              productId: req.query.id,
              price: tp,
              quantity: req.body.q,
            },
          },
        };
        const options = {
          upsert: true,
          new: true,
        };

        const cartSuccess = await cartModal
          .findOneAndUpdate(filter, update, options)
          .exec();

        if (cartSuccess) {
          res.redirect(`/cart?id=${req.query.user}`);
        }
      } else {
        const tp = product.price * req.body.q;
        const updatedCart = await cartModal.findOneAndUpdate(
          { userId: req.query.user, "products.productId": req.query.id },
          {
            $set: {
              "products.$.price": tp,
              "products.$.quantity": req.body.q,
            },
          },
          { new: true }
        );
        if (updatedCart) {
          res.redirect(`/cart?id=${req.query.user}`);
        } else {
          res.send("somthing issues");
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "    addcartpost route");
  }
};

//edit cart fetch
const cartEdit = async (req, res) => {
  try {
    const product = await productModal.findOne({ _id: req.body.i });
    const newval = product.price * req.body.quantity;

    const updatedCart = await cartModal.findOneAndUpdate(
      { _id: req.body.id, "products.productId": req.body.i },
      {
        $set: {
          "products.$.price": newval,
          "products.$.quantity": req.body.quantity,
        },
      },
      { new: true }
    );

    const total = updatedCart.products.reduce(
      (acc, product) => acc + product.price,
      0
    );

    await cartModal.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { TotalPrice: total } }
    );

    res.send({ su: total });
  } catch (err) {
    console.log(err.message + "   cart edit ");
  }
};

//cart remove
const cartree = async (req, res) => {
  try {
    console.log(req.body.tot);
    const remove = await cartModal.updateOne(
      { _id: req.body.id },
      {
        $set: { TotalPrice: req.body.tot },
        $pull: { products: { productId: req.body.proid } },
      }
    );
    if (remove.modifiedCount === 0) {
    } else {
      const rdata = await cartModal.findOne({ _id: req.body.id });
      console.log(rdata);
      res.send({ rdata });
    }
  } catch (err) {
    console.log(err.message + "   catrreeee");
  }
};

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
  try {
    const category = await categoryModal.find({});
    const user = await userSchema.findOne({ _id: req.session.login });
    const cart = await cartModal
      .findOne({ userId: req.session.login })
      .populate("products.productId");

    let add;
    const adress = await addressModal.findOne({ userId: req.session.login });
    if (adress) {
      adress.address.forEach((e) => {
        if (e._id + "hh" == user.addressId + "hh") {
          add = e;
        } else {
        }
      });
      res.render("client/checkout", {
        login: req.session.login,
        add,
        cart,
        category,
      });
    } else {
      res.render("client/checkout", {
        login: req.session.login,
        cart,
        category,
      });
    }
  } catch (err) {
    console.log(err.message + "     checkoutPage page rendiering route");
  }
};

//succes msg rendering
const success = async (req, res) => {
  try {
    const category = await categoryModal.find({ isDeleted: false });
    if (req.session.succes) {
      delete req.session.succes;

      res.render("client/succes", { login: req.session.login, category });
    } else {
      res.redirect("/order");
    }
  } catch (err) {
    console.log(err.message + "   succes page rendering");
  }
};


//postSucces
const postSucces = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.session.login });
    const cart = await cartModal.findOne({ userId: req.session.login });
    const orderSet = await orderModal.create({
      userId: req.session.login,
      orderAmount: cart.TotalPrice,
      deliveryAdress: user.addressId,
      peyment: req.body.peyment,
      deliveryAdress: {
        name: req.body.name,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      },
      orderDate: new Date(),
      OrderedItems: cart.products.map((e) => ({
        productId: e.productId,
        quantity: e.quantity,
        price: e.price,
      })),
    });

    if (orderSet) {
      orderSet.OrderedItems.forEach(async (e) => {
        let product = await productModal.findOne({ _id: e.productId });
        let newstock = product.stock - e.quantity;
        let pr = await productModal.findOneAndUpdate(
          { _id: e.productId },
          { $set: { stock: newstock } }
        );
      });

      const removeCart = await cartModal.updateOne(
        { userId: req.session.login },
        { $unset: { products: 1 } }
      );
      if (removeCart) {
        req.session.succes = true;
        res.redirect("/success");
      } else {
      }
    } else {
      res.send("irs note");
    }
  } catch (err) {
    console.log(err.message + "    postSucces");
  }
};

//order det page rendering
const orderDet = async (req, res) => {
    try {
        const category = await categoryModal.find({ isDeleted: false });
        const order = await orderModal.find({ userId: req.session.login });
        if (order) {
            res.render('client/orderDet', { login: req.session.login, order ,category})
        } else {
            res.render('client/orderDet', { login: req.session.login , category})
        }


    } catch (err) {
        console.log(err.message + '     order det pag erendering ')
    }
}

// order view details page 
const orderView = async (req, res) => {
    try {
        const category = await categoryModal.find({ isDeleted: false });
        const order = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId')
       
        res.render('client/order', { login: req.session.login, order , category})
    } catch (err) {
        console.log(err.message + '      ORDER VIEW PAGE RENDERING ')
    }
}

//editOrder
const editOrder = async (req, res) => {
    try {
        const newOne = await orderModal.findOneAndUpdate({ userId: req.body.user, 'OrderedItems.productId': req.body.id },
            {
                $set: {
                'OrderedItems.$.canceled':true,
                'OrderedItems.$.orderProStatus':'canceled'
                }
            }
        )
        if(newOne){
            res.send({set:true})
        }else{
            res.send({issue:true})

        }
    } catch (err) {
        console.log(err.message + ' /editOrder')
    }
}


//wishlist
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
    cart,
    wishlist,
    adress,
    getadress,
    patchaddress,
    removeadress,
    Defaddress,
    addcart,
    cartEdit,
    cartree,
    addcartPost,
    checkoutPage,
    postSucces,
    success,
    orderView,
    orderDet,
    editOrder,
  
};
