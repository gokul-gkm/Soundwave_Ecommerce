const express = require('express');
const router = express.Router();
const userModal=require('../models/userSchema')
const adminController = require('../controller/admin/adminController');
const adminCategoryController = require('../controller/admin/adminCategoryController');
const adminProductController = require('../controller/admin/adminProductController');
const adminUserController = require('../controller/admin/adminUserController');
const adminOrderController = require('../controller/admin/adminOrderController');
const adminCoupenController = require('../controller/admin/adminCoupenController');
const adminOfferController = require('../controller/admin/adminOfferController');
const adminReportController = require('../controller/admin/adminReportController');
const adminChartController = require('../controller/admin/adminChartController');

const adminMidleware=require('../middleware/adminMiddleware');
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
router.get('/', adminMidleware.adminRoute, adminController.adminPage)

/***************User Management***************/

// user list showing 
router.get('/users', adminMidleware.adminRoute, adminUserController.users)

// remove category
router.get('/userRemove',adminMidleware.adminRoute,adminUserController.userRemove);

//fetching the data
router.post('/user', adminUserController.userBlock)

/***************Category Mangement***************/

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

/***************Product Management***************/

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
router.post('/listedOrnot', adminProductController.productListed)

/***************Order Management***************/

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
router.put('/peyment', adminController.peyment)

//  Return Managing (put)
router.post("/returnManage", adminOrderController.returnManaging);


/***************Coupen management***************/

//coupen get
router.get('/coupen',adminMidleware.adminRoute, adminCoupenController.coupenPage);

//add coupen post
router.post('/coupen', upload.array('images'), adminCoupenController.addCoupen);

// coupen remove
router.delete('/coupenRemove/:id', adminCoupenController.coupenRemove);

//coupen edit 
router.post('/coupenEdit/:id', upload.array('images'), adminCoupenController.coupenEdit);

/************Offers Management************/

//offer page get
router.get('/offer', adminMidleware.adminRoute, adminOfferController.offerPage);

//add offer get
router.get('/addOffer', adminMidleware.adminRoute, adminOfferController.addOfferPage);

//offer creating post
router.post('/offer', adminOfferController.offerCreating);

router.put('/offer/:id', adminOfferController.offerProductAdd)

router.put('/offer/catOffer/:catId', adminOfferController.offerCategoryAdd)

router.get('/offerProduct/:id', adminMidleware.adminRoute, adminOfferController.offerProduct);

router.get('/offerCategory/:id', adminMidleware.adminRoute, adminOfferController.offerCategory);

//offer edit get
router.get('/offeredit/:id', adminMidleware.adminRoute, adminOfferController.offerEdit);

//offeredit post
router.post('/offeredit/:id', adminMidleware.adminRoute, adminOfferController.getOfferEdit);

//offerRemove
router.get('/offerRemove/:id', adminMidleware.adminRoute, adminOfferController.offerRemove);

/************Report************/

//sales report in yearly and monthly and weekly
router.get('/report/:id',adminMidleware.adminRoute,adminReportController.report)

//sales report in yearly and monthly and weekly
router.post('/report/download/:id',adminReportController.reportdownload)

//report custom
router.put('/report', adminReportController.customreport)

/***************Chart***************/

//yearly chart
router.put('/year', adminChartController.year)

//monthly chart
router.put('/monthly', adminChartController.monthlySales)

module.exports=router;