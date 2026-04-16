const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");
const generateOTP = require("../../utils/generateOTP");

const options = { day: "2-digit", month: "short", year: "numeric" };

/**
 * @desc    Render OTP Verification Page
 * @route   GET /otp
 */
const renderOtpPage = async (req, res) => {
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

/**
 * @desc    Verify Submitted OTP
 * @route   POST /otp
 */
const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;

    if (req.session.otp && req.session.forget) {
      if (Number(otp.join("")) === req.session.otp) {
        req.session.otp = undefined;
        res.redirect("/reset-password");
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

/**
 * @desc    Resubmit Email for OTP Verification
 * @route   POST /resubmit
 */
const resubmitEmail = async (req, res) => {
  try {
    req.session.forget = undefined;
    req.session.otp = undefined;
    res.redirect("/login");
  } catch (err) {
    console.log(err.message + "    resbmit Route");
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

module.exports = {
  renderOtpPage,
  verifyOtp,
  resubmitEmail,
  resendOtp,
};
