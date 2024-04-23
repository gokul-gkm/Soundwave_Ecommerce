const userSchema = require("../../models/userSchema");
const categoryModal = require("../../models/catagory");
const productModal = require("../../models/products");
const cartModal = require("../../models/cart");
const wallet = require("../../models/wallet");

const hashPassword = require('../../utils/hashPassword');
const generateOTP = require('../../utils/generateOTP');
const sendEmail = require('../../config/sendEmail');

const bycrypt = require("bcrypt");
require("dotenv").config();

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { getWishlistCount ,getCartCount} = require('../../utils/count'); 

const e = require("express");
const { check, validationResult } = require("express-validator");


const options = { day: "2-digit", month: "short", year: "numeric" };

// routing controllers

// home get
const home = async (req, res) => {
  const limit = 4;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const category = await categoryModal.find({ isDeleted: false, listed: true }); 

    

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
    
    
    const catCount = await productModal.aggregate([
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
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};
//about get
const about = async(req, res) => {
  try {
    const category = await categoryModal.find({ isDeleted: false , listed: true});
    res.render("user/about",{ category});
  } catch (err) {
    console.log(err.message);
  } 
};

//sign-up page get
const signUp = async (req, res) => {
  if (req.session.login) {
    res.redirect("/");
  } else if (req.session.error) {
    const error = req.session.error;
    req.session.error = undefined;
    res.render("user/login", { error: error, activeTab: "signup" });
  } else if (req.session.err1) {
    const err = req.session.err1;
    req.session.err1 = undefined;
    res.render("user/login", { err1: err, activeTab: "signin" });
  } else if (req.session.err2) {
    const err = req.session.err2;
    req.session.err2 = undefined;
    res.render("user/login", { err2: err, activeTab: "signin" });
  } else if (req.session.otp) {
    console.log(req.session.otp);
    res.redirect("/otp");
  } else {
    res.render("user/login", { activeTab: "signin" });
  }
};

//email exist checking
const emailExist = async (req, res) => {
  try {

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

//  signup page post
const signupPost = async (req, res) => {
  try {
    const validationRules = [
      check("registerName", "name must be greater than 3+ characters")
        .trim()
        .isLength({ min: 3 }),
      check("registerEmail", "enter a valid email").trim().isEmail(),
      check("signupPhone", "enter a valid phone number").trim().isMobilePhone(),
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


    await Promise.all(validationRules.map((validation) => validation.run(req)));


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array();
      return res.redirect("/login");
    }

    const sp = await hashPassword(req.body.registerPassword);

    const userData = new userSchema({
      name: req.body.registerName,
      email: req.body.registerEmail,
      password: sp,
      phone: req.body.signupPhone,
    });

    const noUser = await userSchema.findOne({ email: req.body.registerEmail });

    if (noUser) {
      console.log("There is already a user with this email");
    } else {
      req.session.userData = userData;
      req.session.otp = generateOTP();
      console.log(req.session.otp);

      sendEmail(
        req.body.registerName,
        req.body.registerEmail,
        req.session.otp
      );

      setTimeout(() => {
        req.session.otp = undefined;
        console.log("OTP has been cleared after 5 minutes.");
      }, 5 * 60 * 1000);

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
        res.render("user/otp", { message: req.session.wrong });
      } else if (req.session.resend) {
        res.render("user/otp", { resend: req.session.resend });
      } else {
        res.render("user/otp");
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
          phone: req.session.userData.phone,
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

//resend otp
const resend = async (req, res) => {
  try {
    if (req.session.wrong) {
      req.session.wrong = null;
    }
    if (req.session.otp) {
      req.session.otp = generateOTP();
      sendEmail(
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
      res.render("user/forgetPassword");
    } else {
      res.redirect("/otp");
    }
  } catch (err) {
    console.log(err.message + "        forget Password wrong ");
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
    sendEmail(user.name, user.email, req.session.otp);
    setTimeout(() => {
      req.session.otp = undefined;
      console.log("OTP has been cleared after 5 minutes.");
    }, 5 * 60 * 1000);
    res.redirect("/otp");
  } catch (err) {
    console.log(err.message + "       forget gatting route");
  }
};

//geting new pass and the update that
// const getNewPass = async (req, res) => {
//   try {
//     const sp = await hashPassword(req.body.password);
//     if (req.session.login) {
//       const changePass = await userSchema.updateOne(
//         { _id: req.session.login },
//         { $set: { password: sp } }
//       );
//       if (changePass) {
//         res.redirect("/profile?passwordChanged=true");
//       } else {
//         console.log("something change pass not work");
//       }
//     }
//     const updatPass = await userSchema.updateOne(
//       { email: req.session.forget },
//       { $set: { password: sp } }
//     );
//     if (updatPass) {
//       req.session.forget = undefined;
//       res.redirect("/login");
//     } else {
//       console.log("something new pass not work");
//     }
//   } catch (err) {
//     console.log(err.message + "         get new pass route");
//   }
// };

//change
const getNewPass = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.login; 
 
    const user = await userSchema.findById(userId);
    if (!user) {
      console.log("no user");
      return res.status(404).json({ message: 'User not found' });
    }
  
    const isMatch = await bycrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("incorrect");
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
  
    const hashedPassword = await bycrypt.hash(newPassword, 10);
  
    user.password = hashedPassword;
    await user.save();
  
    res.redirect("/profile?passwordChanged=true");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'An error occurred while changing your password' });
  }
}
//till here

//new password page rendering
const newPass = async (req, res) => {
  try {
    if (req.session.forget) {
      res.render("user/newPass");
    } else if (req.session.login) {
      res.render("user/newPass");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "          newpass route");
  }
};

//login post
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

//profile get
const profile = async (req, res) => {
  try {
    if (req.query.passwordChanged === "true") {
      res.locals.passwordChangedAlert =
        "Your password has been changed successfully.";
    }

    const category = await categoryModal.find({
      isDeleted: false,
      listed: true,
    });

    const cartCount = await getCartCount(req.session.login);
    const wishlistCount = await getWishlistCount(req.session.login)

    

    const user = await userSchema.findOne({ _id: req.session.login });

    const wallet1 = await wallet.findOne({ userId: req.session.login });
    const walletAmount = wallet1?.amount || 0;

    if (user.is_admin === 0) { 
      res.render("user/profile", {
        user,
        login: req.session.login,
        category,
        walletAmount,
        cartCount,
        wishlistCount,
        wallet1
      });
    } else {
      req.session.admin = user;
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err.message + "         profile route");
  }
};

//edit profile post
const editProfile = async (req, res) => {
  try {
    const userId = req.query.userId;

    const { name, phone } = req.body;

    const updatedUser = await userSchema.findOneAndUpdate(
      { _id: userId },
      { $set: { name, phone } },
      { new: true }
    );

    if (updatedUser) {
      res.redirect("/profile");
      // res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

 
//404 page
const catchAll = async (req, res) => {
  try {
    const category = await categoryModal.find({ isDeleted: false , listed: true});
      if (req.session.login) {
          res.render('user/404', { login: req.session.login , category})
      }
      else {

          res.render('user/404',{category})
      }
  } catch (err) {
      res.status(400).send({ faild: true })
  }
}
 

module.exports = {
  signUp,
  signupPost,
  home,
  otp,
  gettingOtp,
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
  editProfile,
  catchAll
};
