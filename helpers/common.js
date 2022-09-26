const { Types } = require("mongoose");
const cart_model = require("../model/cart_model");
const category_model = require("../model/category_model");
const product_model = require("../model/product_model");

module.exports = {
  getProduct: (productId) => {
    return new Promise((resolve, reject) => {
      product_model
        .findOne({ _id: Types.ObjectId(productId) })
        .then((product) => {
          resolve(product);
        });
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
            console.log(data);
            let val = data[0] ? data[0].total : "0";
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
};
