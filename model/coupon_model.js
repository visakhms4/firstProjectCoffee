const mongoose = require("mongoose")
const couponSchema = new mongoose.Schema({
    coupon_code : String,
    description : String,
    discount:Number,
    isDelete : Boolean,
})

module.exports = mongoose.model("coupon_model",couponSchema,"coupons")