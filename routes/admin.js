var express = require('express');
const { Types } = require('mongoose');
const { postLogin, getLogout, adminAuth } = require('../controllers/admin/authentication');
const { dispay_products, add_product, post_addProduct, delete_product, getEditProduct, postEditProduct } = require('../controllers/admin/products');
const { display_users, add_user, getBlockUser, getdeleteUser, get_users } = require('../controllers/admin/users');
const {  } = require('../controllers/users/user');
const product_model = require('../model/product_model');
const catogery_model = require('../model/category_model');
const { add_category, post_add_category, get_delete_category, edit_category, post_edit_category } = require('../controllers/admin/category');
const { addCategory, get_category, update_category, getStats, getStatsWeek, getStatsMonth, getStatDay } = require('../helpers/admin/category');
const category_model = require('../model/category_model');
const order_models = require('../model/order_models');
const { getOrders } = require('../helpers/user/orders');
const { get_Allorders, get_order_details, get_order_table, getChangeOrderStatus, getCancelOrder, getOrderDetails } = require('../controllers/admin/orders');
const { getAllUsers } = require('../helpers/user/users');
const { get_individual_orders } = require('../helpers/admin/orders');
const { get_order } = require('../helpers/admin/order_details');
const { addCoupon, getAllCoupons, getTotalSales, getTotalUsers, getTotalSalesAmount, deleteCoupon, getEditCoupons, postEditCoupon } = require('../helpers/admin/coupon');
const { promise, reject } = require('bcrypt/promises');
const { getTotalAmount } = require('../helpers/common');
const { weeklyChart, monthlyChart, dailyChart } = require('../controllers/admin/dash');
const { displayCoupon, getAddCoupon, getdeleteCoupon, getEditCoupon, postCoupon, postECoupon } = require('../controllers/admin/coupon');
const { applyDiscount, clearDiscounts } = require('../helpers/admin/discount');
var router = express.Router();

//admin verification data
const id = "qwerty";
const pass = "qwerty";

//cache control
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});


//route admin login
router.get('/',adminAuth, async function(req, res, next) {

  let totalSales = await getTotalSales();
let userCount = await getTotalUsers();
let salesAmount = await getTotalSalesAmount();
console.log("here",salesAmount);
console.log(salesAmount[0]);
console.log(salesAmount[0].total);

  
  res.render('./admin/admin_page',{admin:true,Sales:totalSales,users:userCount,amount:salesAmount[0].total})
  
  // if(req.session.admin) {
  //   console.log(req.session.admin);
    
  // }else{

  //   res.render('./admin/admin_login',{admin:true});
  //   console.log('started')
  // }
});


//validate admin

router.get('/login', (req, res) => {
  res.render('./admin/admin_login',{admin:true});
})

router.post('/login',postLogin);
router.get('/products',adminAuth,dispay_products);
router.get('/addProduct',adminAuth,add_product);
 router.get('/users',adminAuth,get_users);
router.get('/addUser',adminAuth,add_user);
router.post('/addProduct',adminAuth, post_addProduct);
router.get('/deleteProduct/:id',adminAuth,delete_product);
router.get("/editproduct/:id",adminAuth, getEditProduct);
router.post("/editProduct/:id",adminAuth, postEditProduct);
//router.get("/users",adminAuth, getAllUsers);
router.get("/blockUser/:id",adminAuth, getBlockUser);
router.get("/deleteUser/:id",adminAuth, getdeleteUser);
router.get("/category",adminAuth,add_category)

router.post("/category",adminAuth, post_add_category);
router.get("/deleteCategory/:id",adminAuth, get_delete_category);

router.get("/category/:id",adminAuth, edit_category);
router.post("/category/:id",post_edit_category);

router.get("/orders",adminAuth, get_order_table);

router.get("/order/details/:id",adminAuth,getOrderDetails)


router.post("/order/changeStatus",adminAuth, getChangeOrderStatus)
router.get("/order/cancel/:orderId/:productId",adminAuth, getCancelOrder)


router.get("/stats/week",weeklyChart)

router.get("/stats/month",monthlyChart)

router.get("/stats/day",dailyChart)

router.get("/coupon",adminAuth, displayCoupon)

router.post("/coupon/add", getAddCoupon);
router.get("/deletecoupon/:id",getdeleteCoupon);
router.get("/editcoupon/:id",getEditCoupon)

router.post("/editcoupon/:id",postECoupon)
router.get("/discounts",(req,res) => {

  return new Promise((resolve,reject) => {
    product_model.find({isDelete:false}).then((data) => {
      category_model.find({isDelete:false}).then((categoryData)=> {
        console.log(categoryData);
        const cd = categoryData[0].cdiscount;
        console.log(cd);
        res.render("admin/discounts",{admin:true,products:data,category:categoryData})
      })
      resolve(data)
    })
  })

});
router.post("/discounts/apply",(req,res) => {
  
  console.log(req.body);
  applyDiscount(req.body).then((pdprice)=>{
    console.log(pdprice);
    res.status(200).json(pdprice);
  })
});
router.post("/discounts/null",(req,res)=> {
  console.log("started");
  console.log("her",req.body);
  clearDiscounts(req.body).then((result) => {
    console.log(result);
    res.status(200).json(result);

  })

});


router.get('/logout',getLogout);

module.exports = router;
