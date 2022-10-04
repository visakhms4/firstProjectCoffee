const { response } = require("express");
const { Types } = require("mongoose");
const {
  getAllProducts,
  getCart,
  getTotalAmount,
  changeCartQuantity,
  addToCart,
  removeFromCart,
  getAllSnacksProducts,
  getCartValue,
} = require("../../helpers/common");
const {
  addAddress,
  getCartProdutDetails,
  placeOrder,
} = require("../../helpers/user/orders");
const {
  generateRazorpay,
  payPaypal,
  getAddressById,
  addCheckoutAddress,
  getAddress,
} = require("../../helpers/user/users");
const user_model = require("../../model/user_model");

const paypal = require("paypal-rest-sdk");
const address_model = require("../../model/address_model");
const coupon_model = require("../../model/coupon_model");
const createHttpError = require("http-errors");
const cart_model = require("../../model/cart_model");
paypal.configure({
  mode: "sandbox",
  client_id:
    "AX51G4C3QqcgfYGGlDrKSWnkMIuCNEGLKY8RKNkTsklFY741Qa7qiWSmJQHwORKx0FsGLjMHYCauO1Hc",
  client_secret:
    "ELb1ewObat2QwdP8O7vNdDe_vlEI7lKRfoN-2WuxPg6AeEuf2eVOEoRfKSTQSXCe1H92UvYTP8g0i0TV",
});

module.exports = {
  getUserData: (id) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({ _id: id }).then((user) => {
        console.log(user);
        resolve(user);
      });
    });
  },
  get_products: function (req, res, next) {
    console.log(req.user);
    getAllProducts().then((products) => {
      let user = req.token;
      console.log(user);
      res.render("user/productsView", {
        title: "Coffe Time",
        products: products,
        user: user,
      });
    });
  },
  get_snacks: function (req, res, next) {
    console.log(req.user);
    getAllSnacksProducts().then((snacks) => {
      let user = req.token;
      console.log(user);
      res.render("user/snacks", {
        title: "Coffe Time",
        snacks: snacks,
        user: user,
      });
    });
  },
  get_cart_page: function (req, res, next) {
    const id = req.session.user.userId;
    console.log(id);
    getCart(id).then((data) => {
      getTotalAmount(id).then((total) => {
        console.log(total);
        res.render("user/cart", { data: data, total: total });
      });
    });
  },
  get_add_to_cart: (req, res) => {
    console.log("started");
    console.log(req.params.id, req.session.user.userId);
    //let user = req.cookies.user ? req.cookies.user : null ;

    addToCart(req.params.id, req.session.user.userId).then(() => {
      res.redirect("/");
    });
  },
  get_checkout: (req, res) => {
    getCartValue(req.session.user.userId).then((total) => {
      res.render("user/checkout", { total: total });
    });
  },
  post_checkout: async (req, res, next) => {
    try {
      if (req.body.coupon) {
        var coupon = await validateCoupon(req.body.coupon)
      }
      console.log(req.body);
      let user = req.session.user;
      let addrs = req.cookies.address ? req.cookies.address : null;
      let address = await getAddressById(addrs);
      let orderAddress = await addCheckoutAddress(address);
      console.log(address);
      getCartProdutDetails(user.userId).then((products) => {
        getCartValue(user.userId).then((total) => {
          const data = {
            userId: user.userId,
            addressId: orderAddress._id,
            paymentMethod: req.body.paymentMethod,
          };
          if(coupon){
            console.log(total," ------------ ",  coupon.discount)
            total = total - coupon.discount
            console.log(total)
          }
          placeOrder(data, products, total, coupon?.discount).then((data) => {
            console.log("place", req.body);
            console.log("id", data.id);
            console.log("ttt", data.total);
            if (req.body.paymentMethod == "cod") {
              res.status(200).json({ status: true });
            } else if (req.body.paymentMethod == "paypal") {
              res.status(200).json({ status: true });
            } else {
              generateRazorpay(data.id, data.total * 100).then((response) => {
                let data = {
                  data: response,
                };
                res.status(200).send(data);
                console.log(response);
              });
            }
            // res.render("user/index")
          });
        });
      });
    } catch (err) {
      if(err.status === 400) {

        res.status(400).json("Coupon is not valid")
      }
    }
  },
  post_changequantity: (req, res) => {
    const { cart, product, user, count } = req.body;
    changeCartQuantity(cart, product, count).then((data) => {
      getTotalAmount(user).then((total) => {
        data.total = total;
        console.log(data);
        res.status(200).json(data);
      });
    });
  },
  post_remove_cart: (req, res) => {
    const { cart, product } = req.body;
    let user = req.cookies.user ? req.cookies.user : null;
    removeFromCart(cart, product).then((data) => {
      if (data) {
        res.redirect("/cart");
      } else {
        res.send("some error occured");
      }
    });
  },
  addAddress: (body, userId) => {
    return new Promise((resolve, reject) => {
      const {
        name,
        phone,
        locality,
        city,
        pincode,
        state,
        houseName,
        landmark,
        postOffice,
      } = body;
      let addressObj = {
        userId: userId,
        name: name,
        phone: phone,
        locality: locality,
        city: city,
        state: state,
        pincode: Number(pincode),
        houseName: houseName,
        landmark: landmark,
        postOffice: postOffice,
      };
      address_model.create(addressObj).then((state) => {
        resolve(state);
      });
    });
  },
  getAddresPayment: (req, res) => {
    let user = req.session.user ? req.session.user : null;
    // console.log(user);
    getTotalAmount(user.userId).then((total) => {
      cart_model.updateOne({
        userId:user.userId
       
      },
      {
        $set:{
          cartTotalAmount:total
        }
      }).then(()=>{

        getAddress(user.userId).then((address) => {
          console.log(address);
          console.log("usss",user);
          res.render("user/address", {
            total: total,
            address: address,
            user: user,
          });
        });
      })
    });
  },
};
function validateCoupon(coupon) {
  return new Promise((resolve, reject) => {
    coupon_model.findOne({ coupon_code: coupon }).then((coupon) => {
      if (coupon) {
        console.log("coupon is : ",coupon)
        resolve(coupon);
      } else {
        reject(createHttpError.BadRequest());
      }
    });
  });
}
