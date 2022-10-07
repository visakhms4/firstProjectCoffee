const { number, string } = require("joi")
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
   user_id : Number,
   User_name : String,
   User_email :String,
   User_PhoneNumber :Number,
   User_Password: String,
   isAllowed: Boolean   ,
   User_DeliveryAddress : String,
   User_Totalspend : Number,
   User_cart:Number,
   isDelete : Boolean,
   User_Wallet:Number,
   Referral_Code:String,
   
   
   
  
})

module.exports = mongoose.model("user_models",userSchema,"users")