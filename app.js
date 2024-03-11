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
const fs = require('fs')
const createError = require('http-errors');

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


app.get('/test-error', (req, res, next) => {
  const err = createError(500, 'This is a test error');
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


const port = process.env.PORT || 3001
app.listen(port, () => { console.log('http://localhost:3001') })

module.exports = app;