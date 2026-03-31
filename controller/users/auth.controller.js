const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const hashPassword = require("../../utils/hashPassword");
const { validationResult, check } = require("express-validator");
const generateOTP = require("../../utils/generateOTP");
const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");

/**
 * @desc    Render Login / Signup Page
 * @route   GET /login
 */
const renderAuthPage = (req, res) => {
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

/**
 * @desc    Handle Signup
 * @route   POST /sign-up
 */
const registerUser = async (req, res, next) => {
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

    const hashedPassword = await hashPassword(req.body.registerPassword);

    const userData = new userSchema({
      name: req.body.registerName,
      email: req.body.registerEmail,
      password: hashedPassword,
      phone: req.body.signupPhone,
    });

    const existingUser = await userSchema.findOne({ email: req.body.registerEmail });

    if (existingUser) {
      req.session.emailError= "There is already a user with this email"
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
    next(error);
  }
};

/**
 * @desc    Handle Login
 * @route   POST /sign-in
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, is_block: false , isDeleted: false});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.session.err1 = "Email or password is incorrect";
      return res.redirect("/login");
    }

    req.session.login = user._id;
    res.redirect("/");

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check Email Exists
 * @route   POST /login
 */
const emailExist = async (req, res, next) => {
  try {

    let emailcheck = await userSchema.findOne({ email: req.body.payload });

    if (emailcheck) {
      res.send({ emailExist: "email exist already" });
    } else {
      res.send({ note: "email not exist " });
    }
  } catch (error) {
    next(error)
  }
};


/**
 * @desc    Logout User
 * @route   POST /logout
 */
const logoutUser = (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect("/");
  });
};

module.exports = {
  renderAuthPage,
  registerUser,
  loginUser,
  emailExist,
  logoutUser
};