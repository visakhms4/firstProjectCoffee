const express = require("express");

const {
  getSignIn,
  getSignUp,
  userAuth,
  postSignIn,
  postSignUp,
  stopAuthenticate,
  getLogout,
  postVerifyOtp,
  verifyLogin,
  post_otp_login,
} = require("../controllers/users/authentication");
const { getHome, getProductPage } = require("../controllers/users/main");
const { get_profile, updateUser } = require("../controllers/users/profile");
const { getUserData, get_products, get_cart_page, get_add_to_cart, get_checkout, post_checkout, post_changequantity, post_remove_cart, getAddresPayment, get_snacks } = require("../controllers/users/user");
const {
  addToCart,
  getTotalAmount,
  getAllProducts,
  getCart,
  changeCartQuantity,
  removeFromCart,
} = require("../helpers/common");
const { getCartProdutDetails, placeOrder, getOrders, getOrderDetails, cancelOrders, invoice_getOrderDetails, getPrintingDetails } = require("../helpers/user/orders");
const { verifyPayment, changePaymentStatus, addAddress, getAddress, getOrdersUserside } = require("../helpers/user/users");
const router = express.Router();
const paypal = require("../controllers/users/paypal");
const { getCancelOrder } = require("../controllers/admin/orders");
const user_model = require("../model/user_model");
const { createInvoice } = require("../controllers/users/invoice");
const order_details = require("../helpers/admin/order_details");


// const paypal = require("paypal-rest-sdk");
// const { get_order } = require("../helpers/admin/order_details");
// paypal.configure({
//   mode : 'sandbox',
//   client_id : 'AX51G4C3QqcgfYGGlDrKSWnkMIuCNEGLKY8RKNkTsklFY741Qa7qiWSmJQHwORKx0FsGLjMHYCauO1Hc',
//   client_secret : 'ELb1ewObat2QwdP8O7vNdDe_vlEI7lKRfoN-2WuxPg6AeEuf2eVOEoRfKSTQSXCe1H92UvYTP8g0i0TV' 
// })



// router.use((req, res, next) => {
//   res.setHeader("Cache-Control: no-cache, no-store, must-revalidate")
//   next();
// })
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

/* GET home page. */
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);
router.get("/signup", stopAuthenticate, getSignUp);
router.post("/signup", stopAuthenticate, postSignUp);
router.post("/otpLogin",stopAuthenticate, post_otp_login);
router.get("/otpLogin", function (req, res, next) {
  res.render("user/otp");
});
router.post("/verifyOtp", postVerifyOtp);
router.get("/verifyOtp", function (req, res, next) {
  res.render("user/verifyotp");
});

router.get("/", userAuth, getHome);


router.get("/userOrders/:id",userAuth,(req,res,next) => {
  console.log("begins");
  getOrdersUserside(req.params.id).then((data)=>{
    console.log(data);
    res.render("user/userOrderList",{ orders:data})
  }).catch((err) => {
    console.log(err)
    next(err)
  })
  

})
router.get("/userOrderList/details/:ids/:id",userAuth,(req,res) => {
  console.log("begins");
  getOrderDetails(req.params.ids,req.params.id).then((data)=>{
    console.log("ASWW",data);
    res.render("user/userOrders",{ orders:data})
  })
  

})
// router.get("/product/:id", getProductPage)
router.get("/logout", userAuth, getLogout);

router.get("/products",userAuth,get_products );
router.get("/products/snacks",userAuth,get_snacks)

router.get("/cart",userAuth,get_cart_page);

router.get("/add-to-cart/:id",userAuth, get_add_to_cart );

router.get("/checkout",userAuth,get_checkout);


router.post('/checkout',userAuth,post_checkout)

router.post("/cart/changeQuantity",userAuth,post_changequantity);
router.post("/cart/remove",userAuth,post_remove_cart );

// router.get("/address",(req,res) => {
//   res.render("user/address")

// })

router.get("/address",userAuth, getAddresPayment);

router.post("/address",userAuth, (req, res) => {
  console.log(req.body)
  res.cookie("address", req.body.address, { maxAge: 24*60*60*1000, httpOnly: true });
  res.redirect("/checkout");
});

router.get("/order/:id",async (req,res) => {
  let orderDetails = await getPrintingDetails(req.params.id)
  console.log("order is :",orderDetails)
  const { address,totalAmount } = orderDetails
  console.log(address)
  const addrs = `${address[0].houseName}, ${address[0].locality}`
  const invoice = {
    shipping: {
      name: address[0].name,
      address: addrs,
      city: address[0].city,
      state: address[0].city,
      country: "INR",
      postal_code: address[0].pincode
    }, 
    items: [
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      }
    ],
    subtotal: totalAmount,
    paid: totalAmount,
    invoice_nr: orderDetails._id
  }
  

   

    console.log("started");
  
    createInvoice(invoice, "invoice.pdf");
    console.log("ended");
    res.redirect("/");
 

})


router.post("/verify-payment",userAuth, (req,res) => {
  console.log(req.body);
  console.log("hell");
  verifyPayment(req.body).then(() => {
    console.log("change");
    changePaymentStatus(req.body['order[receipt]']).then(()=> {
      console.log("payment successfull");
      res.json({status:true})
    }).catch((err) => {
      console.log(err);
      res.json({status:false})
    })

  })
  
})
//profile

router.get("/profile",userAuth,get_profile);

// router.post('/pay', (req, res) => {
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//         "payment_method": "paypal"
//     },
//     "redirect_urls": {
//         "return_url": "http://localhost:3000/success",
//         "cancel_url": "http://localhost:3000/cancel"
//     },
//     "transactions": [{
//         "item_list": {
//             "items": [{
//                 "name": "Red Sox Hat",
//                 "sku": "001",
//                 "price": "25.00",
//                 "currency": "USD",
//                 "quantity": 1
//             }]
//         },
//         "amount": {
//             "currency": "USD",
//             "total": "25.00"
//         },
//         "description": "Hat for the best team ever"
//     }]
// };

// paypal.payment.create(create_payment_json, function (error, payment) {
//   if (error) {
//       throw error;
//   } else {
//       for(let i = 0;i < payment.links.length;i++){
//         if(payment.links[i].rel === 'approval_url'){
//           res.redirect(payment.links[i].href);
//         }
//       }
//   }
// });

// });

router.get("/address/add",userAuth, (req,res) => {
  res.render("user/add_address")
})



router.post("/address/add",userAuth, (req, res) => {
  let user = req.session.user ? req.session.user : null;
  console.log("in address router",user)
  addAddress(req.body, user.userId).then((address) => {
    console.log(address)
    res.redirect("/address");
  })});

// router.get('/success',userAuth, (req, res) => {
//   const payerId = req.query.PayerID;
//   const paymentId = req.query.paymentId;

//   const execute_payment_json = {
//     "payer_id": payerId,
//     "transactions": [{
//         "amount": {
//             "currency": "USD",
//             "total": "25.00"
//         }
//     }]
//   };

//   paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//     if (error) {
//         console.log(error.response);
//         throw error;
//     } else {
//         console.log(JSON.stringify(payment));
//         res.send('Success');
//     }
// });
// });


router.get('/cancel',userAuth, (req, res) => res.send('Cancelled'));





router.post("/api/orders", async (req, res) => {
  try {
    let user = req.session.user ? req.session.user : null;
    let total = await getTotalAmount(user.userId);
    const order = await paypal.createOrder(total);
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/api/orders/:orderID/capture", async (req, res) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.get("/order/cancel/:orderId/:productId",(req,res)=>{
  cancelOrders(req.params.orderId,req.params.productId).then(()=>{
    res.redirect("/")
  })
})




//profile address

router.get("/profileaddress",userAuth, (req, res) => {
  let user = req.session.user ? req.session.user : null;
  // console.log(user);
  getTotalAmount(user.userId).then((total) => {
    getAddress(user.userId).then((address) => {
      console.log(address);
      res.render("user/profileaddress", {
        total: total,
        address: address,
        user: user,
      });
    });
  });
},);


router.get("/edituser",(req,res) => {
  console.log("hll",req.session.user.userId);
  getUserData(req.session.user.userId).then((user) => {
    console.log(user);
    res.render("user/editprofile",{data:user})
  })


});

router.post("/edituser",(req,res) => {
  console.log("lll",req.body);
  console.log(req.session.user.userId);
  const id = req.session.user.userId;
updateUser(id,req.body).then((data)=> {
  console.log(data);
  res.redirect("/profile")
})



})



// router.post("/profileaddress",userAuth, (req, res) => {
//   console.log(req.body)
//   res.cookie("address", req.body.address, { maxAge: 24*60*60*1000, httpOnly: true });
//   res.redirect("/checkout");
// })



module.exports = router;
