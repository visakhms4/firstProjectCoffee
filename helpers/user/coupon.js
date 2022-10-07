const { reject } = require("bcrypt/promises");
const createHttpError = require("http-errors");
const { Types, Promise } = require("mongoose");
const cart_model = require("../../model/cart_model");
const coupon_model = require("../../model/coupon_model");
const usedCoupon = require("../../model/usedCoupon");
const user_model = require("../../model/user_model");
const { resetWallet, couponRepeat } = require("../common");
const { id } = require("./joi");


module.exports = {
  updateCoupon: (userId, code) => {
    // console.log(code);
    // console.log("entered");
    let response = {};
    return new Promise(async (resolve, reject) => {
      if (code) {
        console.log("not empty");
        let couponData = await coupon_model.findOne({ coupon_code: code });
        let referralData = await user_model.findOne({ Referral_Code: code });
        
        
        if (couponData) {
        //   console.log("dat",data);
        coupon_model.findOne({$and:[{coupon_code:code},{users:Types.ObjectId(userId)}]}).then((data) => {
          console.log(data);
          if(data){
              console.log("coupon used")
              console.log("here",response);
              let err = "Used Coupon"
              reject(err)
              
          }else{
              console.log("coupon not used");




              const discount = couponData.discount;
              console.log("here", couponData);
       
              cart_model
                .findOne({
                  userId: Types.ObjectId(userId),
                })
                .then((data) => {
                  console.log("dataaaa", data.cartTotalAmount);
                  //   console.log(discount);
                  const total = data.cartTotalAmount - discount;
                  //   console.log(total);
                  cart_model
                    .updateOne(
                      {
                        userId: Types.ObjectId(userId),
                      },
                      {
                        $set: {
                          cartTotalAmount: total,
                        },
                      }
                    )
                    .then(() => {
                      //   console.log("bkah", discount);
                      var Discount = discount;
                      console.log("do", total);
                      response.discount = Discount;
                      response.total = total;
                     couponRepeat(userId,code)
                      resolve(response);
                    });
                });
          }
  
       })
      
      
          
        } else if (referralData) {
          const wallet = referralData.User_Wallet;

          console.log(wallet);
          if (wallet != 0) {
            // console.log("disss");
            cart_model
              .findOne({
                userId: Types.ObjectId(userId),
              })
              .then((data) => {
                // console.log(data.cartTotalAmount);
                const total = data.cartTotalAmount - wallet;
                cart_model
                  .updateOne(
                    {
                      userId: Types.ObjectId(userId),
                    },
                    {
                      $set: {
                        cartTotalAmount: total,
                      },
                    }
                  )
                  .then((data) => {
                    // console.log(data);
                    response.discount = wallet;
                    response.total = total;
                    resetWallet(userId)

                    resolve(response);
                  });
              });
          } else if (wallet == 0) {
            // console.log("empty wallet");
            let err = "Wallet is empty";
            reject(err);
          }
        } else {
          let err = "Coupon doesnot match";
          console.log("hhhh", err);
          reject(err);
        }
      }
      //////////////
      else {
        // console.log("zz",req.body.couponcode);

        // console.log("y",code);
        let err = "Coupon is Empty";
        reject(err);
      }
    });
  },
 
  
};
