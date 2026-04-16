const { StatusCodes } = require("http-status-codes");
const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");
const generateOTP = require("../../utils/generateOTP");
const hashPassword = require("../../utils/hashPassword");
const matchPassword = require("../../utils/matchPassword");


/**
 * @desc    Render Forgot Password Page
 * @route   GET /forget-password
 */
const renderForgetPasswordPage = async (req, res) => {
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

/**
 * @desc    Check Forget Email Exists
 * @route   POST /forget-email-exists
 */
const forgetEmailExist = async (req, res) => {
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

/**
 * @desc    Process Password Reset Request (OTP Flow)
 * @route   POST /forget-password
 */
const forgetPassword = async (req, res) => {
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

/**
 * @desc    Render Reset Password Page
 * @route   GET /reset-password
 */
const renderNewPasswordPage = async (req, res) => {
  try {
    if (req.session.forget) {
      res.render("user/newPass");
    } else if (req.session.login) {
      res.render("user/newPass");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "  newpass route");
  }
};

/**
 * @desc    Update User Password
 * @route   POST /newPass
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.login; 
 
    const user = await userSchema.findById(userId);
    console.log(user);
    if (!user) {
      console.log("no user");
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
  
    const isMatch = await matchPassword(currentPassword, user.password);
    if (!isMatch) {
      console.log("incorrect");
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Current password is incorrect' });
    }
  
    const hashedPassword = await hashPassword(newPassword);
  
    user.password = hashedPassword;
    await user.save();
    // res.redirect("/profile?passwordChanged=true");
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while changing your password' });
  }
}

module.exports = {
    renderForgetPasswordPage,
    forgetEmailExist,
    forgetPassword,
    renderNewPasswordPage,
    updatePassword,
}