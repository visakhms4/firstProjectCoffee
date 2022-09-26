const { reject } = require("bcrypt/promises");
const { Types } = require("mongoose");
const order_models = require("../../model/order_models");

module.exports = {
    get_order : (id) => {
        console.log(id);


      return new Promise((resolve,reject) => {
        // order_models
        // .findOne({ _id: Types.ObjectId(id)}).then((data) => {
        //    // console.log(data);
        //     resolve(data);
        //     console.log("hlloo");
        // })
        


        order_models
        .aggregate([
            {
                $match: {
                    _id : Types.ObjectId(id)
                },
            },
            {
                $lookup: {
                    from:"address",
                    localField: "deliveryDetails",
                    foreignField: "_id",
                    as: "singleOrder"
                },
            },
            {
                $lookup : {
                    from:"products",
                    localField:"products.productId",
                    foreignField:"_id",
                    as:"orderProducts"

                }
            }
        ])
        .then((data) => {
            console.log("jii");
            // console.log(data);
            resolve(data)
        })
      })
        

    },
}