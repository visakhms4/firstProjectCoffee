const { array } = require("joi")
const mongoose = require("mongoose")
const couponSchema = new mongoose.Schema({
    coupon_code : String,
    description : String,
    discount:Number,
    isDelete : Boolean,
    users : Array,
    
})

module.exports = mongoose.model("coupon_model",couponSchema,"coupons")