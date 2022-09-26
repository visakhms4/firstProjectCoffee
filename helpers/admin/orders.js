const { reject } = require("bcrypt/promises");
const { response } = require("express");
const { Types } = require("mongoose");
const order_models = require("../../model/order_models");
const { get_order } = require("./order_details");

module.exports = {
  get_Allorders: function (req, res, next) {
    {
      console.log("stt");
      return new Promise((resolve, reject) => {
        order_models
          .aggregate([
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "order",
              },
            },
            {
              $unwind: "$order",
            },
            {
              $set: {
                date: {
                  $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date", timezone: "+05:30" },
                },
              },
            },
          ])
          .then((data) => {
            console.log(data);
            resolve(data);
          });
      });
    }
  },

  // get_order: (id)=>{
  //   console.log(id);

  //   // return new Promise ((response,reject) => {
  //   //   order_models
  //   //   .findOne({id:Types.ObjectId(id)})

  //   //           }).then((data) => {
  //   //             console.log("hll");
  //   //             console.log(data);
  //   //           })

  // } ,
  get_individual_orders: (id) => {
    console.log(id);
    get_order(id).then((data) => {
      console.log(data);
      console.log("wwow");
    });

    // console.log("indi");
    // return new Promise((resolve,reject) => {
    //   order_models
    //   .aggregate([
    //     {
    //       $lookup: {
    //         from:"address",
    //         localField: "deliveryDetails",
    //         foreignField:"_id",
    //         as:"singleOrder"
    //       },
    //     },
    //     {
    //       $unwind:"$singleOrder"
    //     }
    //   ])
    //   .then((data) =>{
    //     console.log(data);
    //     resolve(data);
    //   });
    // });
  },
  updateOrderStatus: (orderId, productId, status) => {
    return new Promise((resolve, reject) => {
      order_models
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
            "products.productId": Types.ObjectId(productId),
          },
          {
            $set: {
              "products.$.status": status,
              "products.$.finalTotal": "0",
            },
          }
        )
        .then((data) => {
          console.log(data);
          resolve();
        });
    });
  },
  
};
