const { reject } = require("bcrypt/promises")
const { Types } = require("mongoose")
const coupon_model = require("../../model/coupon_model")
const order_models = require("../../model/order_models")
const usedCoupon = require("../../model/usedCoupon")
const user_model = require("../../model/user_model")
const users = require("../user/users")

module.exports = {
    getAllCoupons: () => {
        return new Promise((resolve, reject) => {
            coupon_model.find().then((coupons) => resolve(coupons))
        })
    },
    addCoupon: (body) => {
  

        return new Promise((resolve, reject) => {
            console.log(body)
        const {coupon, description, discount} = body
          coupon_model.create({
            coupon_code: coupon,
            description: description,
            discount: discount,
            
           
          }).then((data) => {
            console.log(data) 
           
            resolve();
          })
        })

      
    },
    deleteCoupon: (id)=> {
      console.log(id);
      return new Promise((resolve,reject) => {
        coupon_model.deleteOne({_id:Types.ObjectId(id)}).then((as) => {
          console.log(as);
          resolve()
        })
        
      })

    },
    EditCoupons: (id) => {
      return new Promise((resolve, reject) => {
          coupon_model.find({_id:Types.ObjectId(id)}).then((coupons) => resolve(coupons))
      }).catch((error) => {
        reject(error)
      })
  },
  posteditCoupon:(id,body)=> {
    try{
      
            return new Promise((resolve,reject)=>{
              const {couponName,couponDescription,couponDiscount } =body;
              coupon_model.updateOne({_id:Types.ObjectId(id)},
              {
                $set:{
                  coupon_code:couponName,
                  description:couponDescription,
                  discount:couponDiscount,
        
        
                }
              }
              ).then(()=>{
                resolve()
              })
            })

    } catch {
      reject() 
    }
    
  },
    getTotalSales :()=> {
      return new Promise((resolve,reject)=>{

        order_models.find({paymentStatus:"placed"}).count()
        .then((count)=> {
          resolve(count)
        })
      })
    
    },
    getTotalSalesAmount : ()=>{
      return new Promise((resolve,reject)=> {
        order_models.aggregate([
          {
            $group:{ _id:null,total:{$sum:"$totalAmount"}}
          }
        ]).then((totalSales)=> {
          resolve(totalSales)
        })

      })
    },
    getTotalUsers: () => {
      return new Promise((resolve,reject) => {
        user_model.find({isDelete:"false"}).count()
        .then((userCount) =>{
          console.log(userCount);
          resolve(userCount)
          
        })
      })
    }
}