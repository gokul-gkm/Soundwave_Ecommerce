const User = require("../../models/userSchema");
const hashPassword = require("../../utils/hashPassword");
const { validationResult, check } = require("express-validator");
const generateOTP = require("../../utils/generateOTP");
const sendEmail = require("../../config/sendEmail");
const userSchema = require("../../models/userSchema");
const matchPassword = require("../../utils/matchPassword");

const OTP_DURATION_MS = 5 * 60 * 1000;

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
  } else if (req.session.emailError) {
    const emailError = req.session.emailError;
    req.session.emailError = undefined;
    res.render("user/login", { emailError: emailError, activeTab: "signup" });
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
      check("registerName")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 40 })
        .withMessage("Name must be between 3 and 40 characters")
        .matches(/^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/)
        .withMessage(
          "Name can contain letters, numbers, and single spaces only"
        )
        .custom((value) => {
          const letterCount = (value.match(/[a-zA-Z]/g) || []).length;

          if (letterCount < 3) {
            throw new Error("Name must contain at least 3 letters");
          }

          return true;
        }),
      check("registerEmail")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isLength({ min: 5 })
        .withMessage("Email is too short")
        .isEmail()
        .withMessage("Invalid email format")
        .matches(/^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .withMessage("Email must have at least 3 characters before @"),
      check("signupPhone", "enter a valid phone number").trim().isMobilePhone(),
      check("registerPassword")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/)
        .withMessage("Password must contain at least one special character"),
      check("registerConfirmPassword")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Confirm Password must be at least 8 characters long")
        .custom((value, { req }) => {
          if (value !== req.body.registerPassword) {
            throw new Error("Passwords do not match");
          }
          return true;
        }),
    ];


    await Promise.all(validationRules.map((validation) => validation.run(req)));


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array();
      return res.redirect("/login");
    }

    const existingUser = await userSchema.findOne({ email: req.body.registerEmail });

    if (existingUser) {
      req.session.emailError = "There is already a user with this email";
      return res.redirect("/login");
    }

    const hashedPassword = await hashPassword(req.body.registerPassword);

    req.session.userData = {
      name: req.body.registerName,
      email: req.body.registerEmail,
      password: hashedPassword,
      phone: req.body.signupPhone,
    };

    req.session.otpPurpose = "signup";

    req.session.otp = generateOTP();
    req.session.otpExpiresAt = Date.now() + OTP_DURATION_MS;
    req.session.otpAttempts = 0;
    req.session.otpResendAt = 0;
    console.log("Signup OTP:", req.session.otp);

    sendEmail(
      req.body.registerName,
      req.body.registerEmail,
      req.session.otp
    );

    return res.redirect("/otp");
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

    if (!user || !(await matchPassword(password, user.password))) {
      req.session.err1 = "Email or password is incorrect";
      return res.redirect("/login");
    }

      req.session.login = user._id;
      if (user.is_admin === 1) {
        req.session.admin = user;
        res.redirect("/admin");
      } else {
          console.log("user")
        res.redirect("/");
    }   

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check Email Exists
 * @route   POST /check-email
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