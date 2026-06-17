const { StatusCodes } = require("http-status-codes");
const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");
const generateOTP = require("../../utils/generateOTP");
const hashPassword = require("../../utils/hashPassword");
const matchPassword = require("../../utils/matchPassword");

const OTP_DURATION_MS = 5 * 60 * 1000;

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
    if (userData) {
      res.send({ emailExist: true });
    } else {
      res.send({ note: "No account found with this email" });
    }
  } catch (err) {
    console.log(err.message + "       forgetEmailExist route");
  }
};

/**
 * @desc    Process Password Reset Request (OTP Flow)
 * @route   POST /forget-password
 */
const forgetPassword = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email, is_block: false });

    if (!user) {
      return res.redirect("/forget-password");
    }

    req.session.forget = user.email;
    req.session.forgetUserName = user.name;
    req.session.otpPurpose = "forget";

    req.session.otp = generateOTP();
    req.session.otpExpiresAt = Date.now() + OTP_DURATION_MS;
    req.session.otpAttempts = 0;
    req.session.otpResendAt = 0;
    console.log("Forget Password OTP:", req.session.otp);

    sendEmail(user.name, user.email, req.session.otp);

    res.redirect("/otp");
  } catch (err) {
    console.log(err.message + "       forget password route");
  }
};

const validatePasswordComplexity = (password) => {
  if (!password || !password.trim()) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[@$!%*?&#^]/.test(password)) return "Password must contain at least one special character";
  return null;
};

/**
 * @desc    Render Reset Password Page
 * @route   GET /reset-password
 */
const renderNewPasswordPage = async (req, res) => {
  try {
    const resetError = req.session.resetError;
    req.session.resetError = undefined;

    if (req.session.forget && req.session.resetAllowed) {
      res.render("user/newPass", { flow: "forget", resetError });
    } else if (req.session.login) {
      res.render("user/newPass", { flow: "change", resetError });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message + "  newpass route");
  }
};

/**
 * @desc    Reset Password 
 * @route   POST /reset-password
 */
const resetForgotPassword = async (req, res) => {
  try {
    if (!req.session.forget || !req.session.resetAllowed) {
      return res.redirect("/login");
    }

    const { newPassword, confirmPassword } = req.body;

    const validationError = validatePasswordComplexity(newPassword);
    if (validationError) {
      req.session.resetError = validationError;
      return res.redirect("/reset-password");
    }

    if (newPassword !== confirmPassword) {
      req.session.resetError = "Passwords do not match";
      return res.redirect("/reset-password");
    }

    const user = await userSchema.findOne({ email: req.session.forget });
    if (!user) {
      req.session.err1 = "User not found. Please try again.";
      return res.redirect("/login");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    req.session.forget = undefined;
    req.session.forgetUserName = undefined;
    req.session.resetAllowed = undefined;
    req.session.otpPurpose = undefined;

    req.session.err2 = "Password reset successful! Please log in.";
    res.redirect("/login");
  } catch (error) {
    console.log(error.message + "  reset forgot password error");
    res.redirect("/login");
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

    const validationError = validatePasswordComplexity(newPassword);
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
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
    resetForgotPassword,
    updatePassword,
}