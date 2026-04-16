/**
 * =========================================================
 *  APPLICATION ENTRY POINT 
 * =========================================================
 */

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const nocache = require("nocache");
const dotenv = require("dotenv");
const createError = require("http-errors");

/**
 * =========================================================
 *  CONFIGURATION
 * =========================================================
 */

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect Database
const connectDB = require("./config/dbconnect");
connectDB();

/**
 * =========================================================
 *  VIEW ENGINE SETUP
 * =========================================================
 */

// Set EJS as template engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "views"));

/**
 * =========================================================
 *  STATIC FILES
 * =========================================================
 */

// Serve static files (CSS, JS, Images)

app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('css', express.static(path.join(__dirname, 'public/css')));
app.use('js', express.static(path.join(__dirname, 'public/js')));




/**
 * =========================================================
 * 🔐 MIDDLEWARES
 * =========================================================
 */

// Parse JSON & Form Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching 
app.use(nocache());

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true in production (HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, 
    },
  })
);

// Flash messages
app.use(flash());

/**
 * =========================================================
 *  ROUTES
 * =========================================================
 */

// User Routes
const userRouter = require("./routes/user");

// Admin Routes
const adminRouter = require("./routes/admin");
const notFound = require("./middleware/notFound.middlware");
const errorHandler = require("./middleware/error.middleware");

// Mount Routes
app.use("/", userRouter);
app.use("/admin", adminRouter);

/**
 * =========================================================
 *  TEST ROUTE (FOR ERROR HANDLING)
 * =========================================================
 */

app.get("/test-error", (req, res, next) => {
  next(createError(500, "This is a test error"));
});

/**
 * =========================================================
 *  404 HANDLER
 * =========================================================
 */

app.use(notFound);

/**
 * =========================================================
 *  GLOBAL ERROR HANDLER
 * =========================================================
 */

app.use(errorHandler);

/**
 * =========================================================
 *  SERVER START
 * =========================================================
 */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;