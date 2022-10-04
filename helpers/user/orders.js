const { Types } = require("mongoose");
// const { PRODUCT_COLLECTION } = require("../../config/collections")
const cart_model = require("../../model/cart_model");
const order_model = require("../../model/order_models");
const address_model = require("../../model/address_model");
const { response } = require("express");
const product_model = require("../../model/product_model");
const order_address_model = require("../../model/order_address_model");
const order_models = require("../../model/order_models");
const moment = require("moment/moment");
const products = require("../../controllers/admin/products");

module.exports = {
//   placeOrder: (order, products, total) => {
//     return new Promise((resolve, reject) => {
//       console.log(order, products, total);
//       let status = order.paymentMethod === "cod" ? "placed" : "pending";
//       let orderObj = {
//         deliveryDetails: {
//           name: order.name,
//           phone: order.phone, 
//           address: order.address,
//         },
//         userId: Types.ObjectId(order.userId),
//         paymentMethod: order.paymentMethod,
//         products: products,
//         totalAmount: total,
//         status: status,
//         date: new Date(),
//       };
//       order_model
//         .create(orderObj)
//         .then((cart) => {
//           cart_model
//             .deleteOne({ userId: Types.ObjectId(order.userId) })
//             .then(() => {
//               resolve();
//             });
//         });
//     });
//   },
  getCartProdutDetails: (userId) => {
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
              $match: {
                cartItems: {
                  $exists: true,
                },
              },
            },
            {
              $set: {
                total: {
                  $multiply: [
                    "$cartItems.quantity",
                    {
                      $toInt: "$cart.Price",
                    },
                  ],
                },
              },
            },
            {
              $project: {
                cartItems: 1,
                total: 1,
              },
            },
          ])
          .then((data) => {
            console.log("total is : ", data);
            data.map((item) => {
              item.cartItems.total = item.total;
              item.cartItems.status = "Order Placed";
            });
            let products = [];
            data.forEach((item) => {
              products.push(item.cartItems);
            });
            console.log("modified data is : ", data);
            resolve(products);
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  placeOrder: (data, products, total, coupon_discount = 0) => {
    return new Promise((resolve, reject) => {
      console.log( "total : ",total);
      let status = data.paymentMethod === "cod" ? "placed" : ("paypal") ? "placed" : "pending"
      let orderObj = {  
        deliveryDetails: Types.ObjectId(data.addressId),
        userId: Types.ObjectId(data.userId),
        paymentMethod: data.paymentMethod,
        products: products,
        totalAmount: total,
        coupon_discount : coupon_discount,
        paymentStatus: status,
        date: new Date(), 
      };
      
      // get()
      //   .collection(ORDER_COLLECTION)
      //   .insertOne(orderObj)
        order_model.create(orderObj)
        .then((cart) => {
          // get()
          //   .collection(CART_COLLECTION)
            cart_model
            .deleteOne({
              userId: Types.ObjectId(data.userId),
            })
            .then((data) => {
              console.log("ass");
              console.log(cart);
              const a = cart._id;
              console.log("hii",a);
              console.log(cart.totalAmount);
              const details = {
                id : a,
                total : cart.totalAmount
              }
              resolve(details);
            });
        });
    });
  },
  getOrders: (userId) => {
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $match: {
              userId: Types.ObjectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: product_model,
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $sort: {date: -1}
          }
        ])
        .then((data) => {
 
          console.log("thi is",data);
          resolve(data); 
        });
    });
  },
  // getOrderDetails: (orderId) => {
  //   return new Promise((resolve, reject) => {
  //     order_model
  //       .aggregate([
  //         {
  //           $match: {
  //             _id: Types.ObjectId(orderId),
  //           },
  //         },
  //         {
  //           $unwind: "$products",
  //         },
  //         {
  //           $lookup: {
  //             from: PRODUCT_COLLECTION,
  //             localField: "products.productId",
  //             foreignField: "_id",
  //             as: "productDetails",
  //           },
  //         },
  //         {
  //           $unwind: "$productDetails",
  //         },
  //       ])
  //       .then((data) => {
  //         resolve(data);
  //       });
  //   });
  // },
  cancelOrders: (orderId, productId) => {
    return new Promise((resolve, reject) => {
      console.log(orderId, productId);
      console.log("orderid is",orderId);
      order_models
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
            "products.productId": Types.ObjectId(productId),
          },
          {
            $set: {
              "products.$.status": "cancelled",
            },
          }
        )
        .then((data) => {
          console.log("im here",data);
          resolve();
        });
    });
  },
  getOrderDetails: (orderId, productId) => {
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $match: {  
              _id: Types.ObjectId(orderId),
            }, 
          },
          {
            $lookup: {
              from:"products", 
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          // {
          //   $set: {
          //     productDetails : {$sortArray: { input: "$productDetails", sortBy: { _id: 1 } }}
          //   }
          // },
          {
            $lookup: {
              from:" orderAddress",   
              localField: "deliveryDetails",
              foreignField: "_id",
              as: "address",
            },  
          },
        ])
        .then((data) => {
          // console.log("im here",data[0]);
         
          resolve(data[0]);
        });
    });
  },
 getPrintingDetails: (orderId) => {
  return new Promise((resolve, reject) => {
    order_model.aggregate([
      {$match: {_id: Types.ObjectId(orderId)}},
      {$lookup: {
        from: "orderAddress",
        localField: "deliveryDetails",
        foreignField: "_id",
        as: "address"
      }},
      {$lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails"
      }},

    ]).then((data) => {
      resolve(data[0])
    })
  })
 },
//  getInvoiceproducts:(id)=> {
//   return new Promise((resolve,reject) => {

//     product_model.findOne({_id:Types.ObjectId(id)}).then((products)=> {
//       console.log(products);
//       resolve(products)
//     })
//   })
    


//  }
};
