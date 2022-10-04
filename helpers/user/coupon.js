const createHttpError = require("http-errors");
const { Types } = require("mongoose");
const cart_model = require("../../model/cart_model");
const coupon_model = require("../../model/coupon_model");

module.exports = {
    updateCoupon : (userId,code)=> {
        console.log(code);
        console.log("entered");
        return new Promise((resolve,reject) => {
            if(code){
              
              console.log("not empty");
               coupon_model.findOne({coupon_code:code}).then((data) => {
                console.log(userId);
                if(data){
                //   console.log("dat",data);
                  const discount = data.discount;
                  console.log(discount);
                  
                  cart_model.findOne({
                    userId:Types.ObjectId(userId)
                  }).then((data)=> {
                    console.log(data.cartTotalAmount);
                    console.log(discount);
                    const total = (data.cartTotalAmount - discount)
                    console.log(total);
                    cart_model.updateOne({
                        userId:Types.ObjectId(userId)
                    },
                    {
                        $set:{
                            cartTotalAmount:total,
                        }
                    }).then(() => {
                        console.log("bkah",discount);
                        resolve(total,discount)
                        
                    })
             })
                  
                }else{
                  reject(createHttpError.Unauthorized("Coupon Doesn't Match"))
        
                  
                  console.log("coupon doesnt match");
                } 
                
              })
            }else{
        
              // console.log("zz",req.body.couponcode);
              
              // console.log("y",code);
              reject(createHttpError.Unauthorized("Coupon is Empty"))
          
              console.log("empty");
            }
          
        
            
          })
    }
}