const { reject, promise } = require("bcrypt/promises");
const { Promise, Types } = require("mongoose");
const product_model = require("../../model/product_model");
const user_model = require("../../model/user_model");

module.exports = {
    applyDiscount : (body) => {
        console.log("entered");
        return new Promise((resolve,reject) => {
            
            const {productId,discount } = body;
            console.log(productId);
            product_model.findOne({_id:productId}).then((data) => {

                console.log(data);
                pdprice = parseInt(data.Price - (discount * data.Price) / 100)
                console.log(data.pd_price);
                product_model.updateOne({
                    _id : productId
                },
                {
                   $set: {
                    pdiscount:discount,
                    pd_price:pdprice,
                
                   } 
                }
    
                ).then((data)=> {
                    console.log("final",data);
                    resolve(pdprice)
                })
            })

        })

    
    },
    clearDiscounts : (body)=> {
        console.log(body);
        return new Promise ((resolve,reject) => {
            console.log(body.productId);
            const id  = body.productId
            product_model.findOne({_id:id}).then((data) => {
                console.log(data);
                const amount = data.Price;
                console.log(data.pd_price);
                product_model.updateOne({
                    _id:id
                },
                {
                    $set: {
                        pdiscount:0,
                        pd_price:amount, 
                    }
                }).then((result) => {
                    console.log(data.Price);
                    resolve(data.Price)
                })
            })
        })

    }
}