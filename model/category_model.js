const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    Category_name : String,
    Category_description : String,
    cdiscount:Number,
    isDelete : Boolean,
})

module.exports = mongoose.model("catogery_models",userSchema,"category")