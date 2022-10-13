const { reject } = require("bcrypt/promises");
const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const { resource } = require("../app");
const cart_model = require("../model/cart_model");
const category_model = require("../model/category_model");
const coupon_model = require("../model/coupon_model");
const product_model = require("../model/product_model");
const usedCoupon = require("../model/usedCoupon");
const user_model = require("../model/user_model");
const { error } = require("./user/joi");

module.exports = {
  getProduct: (productId) => {
    return new Promise((resolve, reject) => {
 try{
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    reject(createHttpError.BadRequest());
  }

     product_model 
       .findOne({ _id: Types.ObjectId(productId) })
       .then((product) => {
       

           resolve(product);
        
       })
      } catch (error) {
        reject(error)

      }
  
    });
  },
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      product_model.find({isDelete:"false",Category:"Drinks"}).then((products) => {
        resolve(products);
      });
    });
  },
  getAllSnacksProducts: () => {
    return new Promise((resolve, reject) => {
      product_model.find({isDelete:"false",Category:"Snacks"}).then((Snacks) => {
        console.log(Snacks);
        resolve(Snacks);
      });
    });
  },
  getProductLimit: (limit) => {
    return new Promise((resolve, reject) => {
      product_model
        .find({ isDelete: false })
        .limit(limit)
        .then((products) => {
          resolve(products);
        });
    });
  },
  addToCart: (proId, userId) => {
    console.log("prodid", proId);
    console.log("userId", userId);
    return new Promise((resolve, reject) => {
      cart_model
        .findOne({ userId: Types.ObjectId(userId) })
        .then((userCart) => {
          //console.log(userCart);

          if (userCart) {
            cart_model
              .findOne({
                userId: Types.ObjectId(userId),
                "cartItems.productId": Types.ObjectId(proId),
              })
              .then((product) => {
                console.log("product is string", product);
                if (product) {
                  cart_model
                    .updateOne(
                      {
                        userId: Types.ObjectId(userId),
                        "cartItems.productId": Types.ObjectId(proId),
                      },
                      {
                        $inc: {
                          "cartItems.$.quantity": 1,
                        },
                      }
                    )
                    .then((status) => {
                      resolve(status);
                    });
                } else {
                  console.log("userCart");
                  productObj = {
                    productId: Types.ObjectId(proId),
                    quantity: 1,
                  };

                  cart_model
                    .updateOne(
                      {
                        userId: Types.ObjectId(userId),
                      },
                      {
                        $push: {
                          cartItems: productObj,
                        },
                      }, 
                      {
                        upsert: true,
                      }
                    )
                    .then(() => {
                      resolve();
                    });
                }
              });
          } else {
            let cartObj = {
              userId: Types.ObjectId(userId),
              cartItems: {
                productId: Types.ObjectId(proId),
                quantity: 1,
              },
            };
            cart_model.create(cartObj).then((response) => {
              resolve();
            });
          }
        });
    });
  },

  getCart: (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
      try {
        cart_model
          .aggregate([
            {
              $match: {
                userId: Types.ObjectId(userId),
              },
            },
            {
              $unwind: "$cartItems",
            },
            {
              $lookup: {
                from: "products",
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $unwind: "$product",
            },
          ])
          //   .toArray()
          .then((data) => {
            console.log(data);
            resolve(data);
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  getTotalAmount: (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
      try {
        cart_model
          .aggregate([
            {
              $match: {
                userId: Types.ObjectId(userId),
              },
            },
            {
              $unwind: "$cartItems",
            },
            {
              $lookup: {
                from: 'products',
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "cart",
              },
            },
            {
              $unwind: "$cart",
            },
            {
              $unset: ["userId"],
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      "$cartItems.quantity",
                      { $toInt: "$cart.Price" },
                    ],
                  },
                },
              },
            },
            {
              $unset: ["_id"],
            },
          ])
          .then((data) => {
            console.log("cart",data);
            let val = data[0] ? data[0].total : "0";
          
              
            console.log(val)
                resolve(val);
              
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  changeCartQuantity: (cartId, productId, count) => {
    console.log(cartId, productId, count);
    count = Number(count);
    return new Promise((resolve, reject) => {
      cart_model
        .updateOne({
          _id: Types.ObjectId(cartId),
          'cartItems.productId': Types.ObjectId(productId)
        }, {
          $inc: {
            'cartItems.$.quantity': count
          },
        })
        .then((status) => {

          resolve(status);
        });
    })
  },
  removeFromCart: (cartId, productId) => {
    return new Promise((resolve, reject) => {
      cart_model
        .updateOne({
          _id: Types.ObjectId(cartId),
          'cartItems.productId': Types.ObjectId(productId)
        }, {
          $pull: {
            'cartItems': {'productId':Types.ObjectId(productId)  }
          }
        })
        .then((status) => { 
          console.log(status)
          resolve(status);
        });
    })
  },
  getCartValue: (id)=>{
    console.log("hhh",id);
    return new Promise((resolve,reject) => {
      cart_model.find({userId:Types.ObjectId(id)}).then((data)=> {
        console.log(data);
        let total = data[0].cartTotalAmount
        console.log(total);
        resolve(total)

      })
    })

  },resetWallet: (id) => {
    user_model
      .updateOne(
        {
          _id: Types.ObjectId(id),
        },
        {
          User_Wallet: 0,
        }
      )
      .then((data) => {
        console.log(data);
      });
  },
  updateUser:(id,body)=> {

    console.log("hellow");
    const { Username,Email,number } = body;
    console.log("here",body);
    return new Promise((resolve,reject) => {
      user_model.updateOne(
        {
          _id :id 
        },
        {
          $set: {
            User_name : Username,
            User_email : Email,
            User_PhoneNumber : number,
          },
        }
      ).then((result) => {
        resolve(result)
      })
    })
  },
  couponRepeat:(id,code) => {
  console.log("strr");
  coupon_model.updateOne({coupon_code:code},{$push:{users:Types.ObjectId(id)}},{upsert:true}).then((status) => {
    console.log(status);
  })

  },
};
