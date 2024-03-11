const express = require('express');
const router = express.Router();
const userModal=require('../models/userSchema')
const adminController = require('../controller/adminController');
const adminCategoryController = require('../controller/adminCategoryController');
const adminProductController = require('../controller/adminProductController');
const adminUserController = require('../controller/adminUserController');
const adminOrderController = require('../controller/adminOrderController');
const adminCoupenController = require('../controller/adminCoupenController');
const adminOfferController = require('../controller/adminOfferController');
const adminReportController = require('../controller/adminReportController');

const adminMidleware=require('../middleware/admin');
const path = require('path');
const multer=require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/productImage'));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + ' - ' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

//admin dashborad page rendering
router.get('/',adminMidleware.adminRoute,adminController.adminPage)

// user list showing 
router.get('/users', adminMidleware.adminRoute, adminUserController.users)

// remove category
router.get('/userRemove',adminMidleware.adminRoute,adminUserController.userdlt);

//fetching the data
router.post('/user',adminUserController.blockFetch)

// catagory page rendering
router.get('/catagory',adminMidleware.adminRoute,adminCategoryController.category)

// /categoryFetch 
router.post('/categoryFetch',adminMidleware.adminRoute,adminCategoryController.categoryFetch)

// catgory add page rendering
router.get('/catagoryAdd',adminMidleware.adminRoute,adminCategoryController.catgoryAdd)

// getting category dets
router.post('/catgoryAdd',adminMidleware.adminRoute,adminCategoryController.getcatgoryAdd);

// remove category
router.get('/Catremove',adminMidleware.adminRoute,adminCategoryController.categorydlt);

//  category active or not fecting
router.post('/activeOrnot', adminCategoryController.catgoryActive);

//product dets page rendering
router.get('/product',adminMidleware.adminRoute,adminProductController.productDets)

//product add route
router.get('/productAdd',adminMidleware.adminRoute,adminProductController.productAdd);

//getting product
router.post('/productAdd',upload.array('images', 3),adminProductController.getproduct)

// edi route
router.post('/edit',upload.fields([{ name: 'images0', maxCount: 1 },{ name: 'images1', maxCount: 1 },{ name: 'images2', maxCount: 1 }]),adminProductController.editProduct)

//dlt product
router.get('/dltProduct', adminProductController.dltPro);

//list product
router.post('/listedOrnot',adminProductController.productListed)

//order list 
router.get('/orders', adminMidleware.adminRoute, adminOrderController.order)

//order status changing
router.put('/orderStatus',adminOrderController.orderProstatus);

//remove order product
router.put('/removeorder',adminOrderController.removeorder)

//remove order full
router.patch('/removeorder',adminOrderController.removeordeFull)

//order view
router.get('/ordersView/:id',adminMidleware.adminRoute,adminOrderController.orderView)


//peyment chart fetching
router.put('/peyment',adminController.peyment)

//yaer fetching
router.put('/year', adminController.year);

//coupen get
router.get('/coupen',adminMidleware.adminRoute, adminCoupenController.coupenPage);

//add coupen post
router.post('/coupen', upload.array('images'), adminCoupenController.addCoupen);

// coupen remove
router.delete('/coupenRemove/:id', adminCoupenController.coupenRemove);

//coupen edit 
router.post('/coupenEdit/:id', upload.array('images'), adminCoupenController.coupenEdit);

/************offers************/

//offer page get
router.get('/offer', adminMidleware.adminRoute, adminOfferController.offerPage);

//add offer get
router.get('/addOffer', adminMidleware.adminRoute, adminOfferController.addOfferPage);

//offer creating post
router.post('/offer', adminOfferController.offerCreating);

router.put('/offer/:id', adminOfferController.offerProductAdd)

router.get('/offerProduct/:id', adminMidleware.adminRoute, adminOfferController.offerProduct);

//offer edit get
router.get('/offeredit/:id', adminMidleware.adminRoute, adminOfferController.offerEdit);

//offeredit post
router.post('/offeredit/:id', adminMidleware.adminRoute, adminOfferController.getOfferEdit);

//offerRemove
router.get('/offerRemove/:id', adminMidleware.adminRoute, adminOfferController.offerRemove);


//sales report in yearly and monthly and weekly
router.get('/report/:id',adminMidleware.adminRoute,adminReportController.report)

//sales report in yearly and monthly and weekly
router.post('/report/download/:id',adminReportController.reportdownload)

//report custom
router.put('/report',adminReportController.customreport)

module.exports=router;