const { reject } = require("bcrypt/promises");
const { Types, default: mongoose } = require("mongoose");
const user_model = require("../../model/user_model");

const Razorpay = require("razorpay");
const { response } = require("express");
const { resolve } = require("path");
const order_models = require("../../model/order_models");
const { type } = require("os");
const address_model = require("../../model/address_model");
const order_address_model = require("../../model/order_address_model");
const product_model = require("../../model/product_model");
const createHttpError = require("http-errors");

var instance = new Razorpay({
  key_id: "rzp_test_Ko2tJNGFw5ycqv",
  key_secret: "rnUQPlvG6t9JdKwW9loqzaw9",
});



module.exports = {
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      user_model.find({ isDelete: false }).then((users) => {
        resolve(users);
      });
    });
  },
  getUser: () => {
    return new Promise((resolve, reject) => {
      user_model.find({ _id: Types.ObjectId(id) }).then((users) => {
        resolve(users);
      });
    });
  },
  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      user_model
        .updateOne({ _id: Types.ObjectId(id) }, { $set: { isDelete: true } })
        .then((done) => {
          if (done) {
            resolve(done);
          } else {
            console.log("some error happened");
          }
        });
    });
  },
  blockUnblock: (id) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({ _id: Types.ObjectId(id) }).then((result) => {
        if (result.isAllowed) {
          user_model
            .updateOne(
              { _id: Types.ObjectId(id) },
              { $set: { isAllowed: false } }
            )
            .then((status) => {
              resolve(status);
            });
        } else {
          user_model
            .updateOne(
              { _id: Types.ObjectId(id) },
              { $set: { isAllowed: true } }
            )
            .then((status) => {
              resolve(status);
            });
        }
      });
    });
  },
  generateRazorpay: (orderId, totalAmount) => {
    console.log(orderId);
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalAmount, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("new order ", order);
        resolve(order);
      });
    });
  },
  verifyPayment: (data) => {
    return new Promise((resolve, reject) => {
      console.log("hqqq", data);
      const crypto = require("crypto");

      var hmac = crypto.createHmac("sha256", "rnUQPlvG6t9JdKwW9loqzaw9");

      console.log(
        data["payment[razorpay_order_id]"] +
          "|" +
          data["payment[razorpay_payment_id]"]
      );
      hmac.update(
        data["payment[razorpay_order_id]"] +
          "|" +
          data["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      console.log(hmac, " ---  ", data["payment[razorpay_signature]"]);
      if (hmac == data["payment[razorpay_signature]"]) {
        console.log("cryp");
        resolve();
      } else {
        reject("dfgh");
      }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      console.log(orderId);
      order_models
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
          },
          {
            $set: {
              paymentStatus: "placed",
            },
          }
        )
        .then((data) => {
          console.log("updated payment status ", data);
          resolve();
        })
        .catch((err) => {
          console.log("Error on payment updation", err);
        });
    });
  },
  payPaypal: (req, res) => {
    return new Promise((resolve, reject) => {
     
    })
  },
  addAddress: (body, userId) => {
    console.log("in add address",body)
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
        postOffice
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
  getAddress: (userId) => {
    return new Promise((resolve, reject) => {
      console.log(userId)
      address_model.find({ userId: Types.ObjectId(userId) }).then((address) => {
        resolve(address);
      });
    });
  },
  getAddressById: (addressId) => {
    return new Promise((resolve, reject) => {
      address_model
        .findOne({ _id: Types.ObjectId(addressId) })
        .then((address) => {
          resolve(address);
        });
    });
  },
  addCheckoutAddress: (address) => {
    console.log("address is : ", address);
    const {
      name,
      phone,
      locality,
      city,
      pincode,
      state,
      houseName,
      landmark,
      userId,
      postOffice,
    } = address;
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
    return new Promise((resolve, reject) => {
      order_address_model.create(addressObj).then((state) => {
        resolve(state);
      });
    });
  },
  getOrdersUserside: (userId) => {
      return new Promise((resolve, reject) => {
        if(!mongoose.Types.ObjectId.isValid(userId)){
          reject(createHttpError.BadRequest())
        }
        console.log('userId');
        order_models
          .aggregate([
            {
              $match: {
                userId: Types.ObjectId(userId),
              },
            },
            {
              $lookup: {
                from: 'orderAddress',
                localField: "deliveryDetails",
                foreignField: "_id",
                as: "address",
              },
            },
            {
              $lookup: {
                from: 'products',
                localField: "products.productId",
                foreignField: "_id",
                as: "productDetails",
              }, 
            }, 
            {
              $set: {
                date: {
                  $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date" },
                },
              },
            },
            // {
            //   $set: {
            //     productDetails : {$sortArray: { input: "$productDetails", sortBy: { _id: 1 } }}
            //   }
            // },
            {
              $sort: { date: -1 }
            }
          ])
          .then((data) => {
            data[0] ? 
            resolve(data) : reject(createHttpError.NotFound())
          });
      }); 
    
  },


  getUserData: (id)=> {
    console.log(id);

  },
}