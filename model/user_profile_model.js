const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({

   User_name :{
     type: String,
    
   } ,
   Email_id :{
    type: String,
    require:true
   } ,
   Phone_number : {
    type: String,
    require:true
   } ,
   Category : {
    type: String,
    require:true
   } ,
   Price : {
    type: Number,
    require:true
   } ,
   Number_of_sales : {
    type: Number,
    require:true
   } ,
   isDelete : {
    type : Boolean
   }
})

module.exports = mongoose.model("product_models",userSchema)