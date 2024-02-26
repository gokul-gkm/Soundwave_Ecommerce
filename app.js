const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const bycrypt = require('bcrypt');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const nocache = require('nocache');
const dotEnv = require('dotenv');
const app = express();
const fs=require('fs')

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('css', express.static(path.join(__dirname, 'public/css')));
app.use('js', express.static(path.join(__dirname, 'public/js')));

app.use(session({secret: process.env.SESSION_SECRET,resave: false,saveUninitialized: true}))
app.use(nocache())
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', userRouter);
app.use('/admin', adminRouter)


// error handler
app.use(function (err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("Hi"+res.locals.error);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// app.get('/error', (req, res, next) => {
//   const err = new Error('This is a simulated error');
//   err.status = 500; // Set the status code of the error
//   next(err); // Pass the error to the next middleware
// });

app.listen(process.env.PORT, () => { console.log('http://localhost:3001') })





module.exports = app;
