const userSchema = require("../../models/userSchema");
const generateOTP = require('../../utils/generateOTP');
const sendEmail = require('../../config/sendEmail');

const bcrypt = require("bcrypt");
require("dotenv").config();


const options = { day: "2-digit", month: "short", year: "numeric" };


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

//change
const getNewPass = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.login; 
 
    const user = await userSchema.findById(userId);
    console.log(user);
    if (!user) {
      console.log("no user");
      return res.status(404).json({ message: 'User not found' });
    }
  
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("incorrect");
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    user.password = hashedPassword;
    await user.save();
    // res.redirect("/profile?passwordChanged=true");
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'An error occurred while changing your password' });
  }
}

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

module.exports = {
  otp,
  gettingOtp,
  resubmit,
  resend,
  forgetPassword,
  forgetemailExist,
  forget,
  newPass,
  getNewPass,
};
