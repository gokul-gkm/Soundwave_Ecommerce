const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");
const generateOTP = require("../../utils/generateOTP");

const options = { day: "2-digit", month: "short", year: "numeric" };

const OTP_DURATION_MS = 5 * 60 * 1000; 
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/**
 * @desc    Render OTP Verification Page
 * @route   GET /otp
 */
const renderOtpPage = async (req, res) => {
  try {
    if (!req.session.otp || !req.session.otpExpiresAt) {
      return res.redirect("/login");
    }

    const remaining = Math.max(0, Math.floor((req.session.otpExpiresAt - Date.now()) / 1000));

    const resendCooldown = Math.max(0, Math.floor((( req.session.otpResendAt || 0) - Date.now()) / 1000));

    const wrongOtp = req.session.wrong || false;
    const resendMsg = req.session.resend || false;
    const expiredMsg = remaining <= 0;
    const attemptsLeft = MAX_OTP_ATTEMPTS - (req.session.otpAttempts || 0);

    req.session.wrong = undefined;
    req.session.resend = undefined;

    res.render("user/otp", {
      remaining,
      resendCooldown,
      wrongOtp,
      resendMsg,
      expiredMsg,
      attemptsLeft,
      maxAttempts: MAX_OTP_ATTEMPTS,
    });
  } catch (err) {
    console.log(err.message + "    otp render error");
  }
};

/**
 * @desc    Verify Submitted OTP
 * @route   POST /otp
 */
const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;

    if (!req.session.otp || !req.session.otpExpiresAt) {
      return res.redirect("/login");
    }

    if (Date.now() > req.session.otpExpiresAt) {
      req.session.otp = undefined;
      req.session.otpExpiresAt = undefined;
      req.session.otpAttempts = undefined;
      req.session.wrong = "expired";
      return res.redirect("/otp");
    }

    req.session.otpAttempts = (req.session.otpAttempts || 0) + 1;
    if (req.session.otpAttempts > MAX_OTP_ATTEMPTS) {
      req.session.otp = undefined;
      req.session.otpExpiresAt = undefined;
      req.session.otpAttempts = undefined;
      req.session.userData = undefined;
      req.session.forget = undefined;
      req.session.otpPurpose = undefined;
      req.session.err1 = "Too many wrong OTP attempts. Please try again.";
      return res.redirect("/login");
    }

    const enteredOtp = Number(otp.join(""));

    // ── Forget Password Flow ──
    if (req.session.otpPurpose === "forget" && req.session.forget) {
      if (enteredOtp === req.session.otp) {
        req.session.otp = undefined;
        req.session.otpExpiresAt = undefined;
        req.session.otpAttempts = undefined;
        req.session.otpPurpose = undefined;
        req.session.resetAllowed = true;
        return res.redirect("/reset-password");
      } else {
        req.session.wrong = true;
        return res.redirect("/otp");
      }
    }

    // ── Signup Flow ──
    if (enteredOtp === req.session.otp) {
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
        req.session.otpExpiresAt = undefined;
        req.session.otpAttempts = undefined;
        req.session.wrong = undefined;
        req.session.userData = undefined;
        req.session.otpPurpose = undefined;
        res.redirect("/profile");
      } else {
        res.send("Something went wrong while saving user");
      }
    } else {
      req.session.wrong = true;
      res.redirect("/otp");
    }
  } catch (err) {
    console.log(err + "       otp verify error");
  }
};

/**
 * @desc    Resubmit Email for OTP Verification (go back to login/signup)
 * @route   POST /resubmit
 */
const resubmitEmail = async (req, res) => {
  try {
    req.session.forget = undefined;
    req.session.otp = undefined;
    req.session.otpExpiresAt = undefined;
    req.session.otpAttempts = undefined;
    req.session.userData = undefined;
    req.session.otpPurpose = undefined;
    req.session.resetAllowed = undefined;
    res.redirect("/login");
  } catch (err) {
    console.log(err.message + "    resubmit Route error");
  }
};

/**
 * @desc    Resend OTP to User Email
 * @route   GET /resend
 */
const resendOtp = async (req, res) => {
  try {
    if (req.session.wrong) {
      req.session.wrong = null;
    }

    if (!req.session.otp && !req.session.otpExpiresAt) {
      return res.redirect("/login");
    }

    if (req.session.otpResendAt && Date.now() < req.session.otpResendAt) {
      req.session.resend = "cooldown";
      return res.redirect("/otp");
    }

    req.session.otp = generateOTP();
    req.session.otpExpiresAt = Date.now() + OTP_DURATION_MS;
    req.session.otpAttempts = 0;
    req.session.otpResendAt = Date.now() + OTP_RESEND_COOLDOWN_MS;
    console.log("Resend OTP:", req.session.otp);

    let email, name;
    if (req.session.otpPurpose === "forget" && req.session.forget) {
      email = req.session.forget;
      name = req.session.forgetUserName || "User";
    } else if (req.session.userData) {
      email = req.session.userData.email;
      name = req.session.userData.name;
    } else {
      return res.redirect("/login");
    }

    sendEmail(name, email, req.session.otp);

    req.session.resend = true;
    res.redirect("/otp");
  } catch (err) {
    console.log(err.message + "       resend route error");
  }
};

module.exports = {
  renderOtpPage,
  verifyOtp,
  resubmitEmail,
  resendOtp,
};
