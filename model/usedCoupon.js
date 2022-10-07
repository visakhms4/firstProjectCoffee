const { string, array } = require('joi')
const mongoose = require('mongoose')

const usedCouponSchema = new mongoose.Schema({
    coupon:String,
    users:Array,

})  
module.exports = mongoose.model("used_coupon_models",usedCouponSchema,"usedcoupons")