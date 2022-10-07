const { applyDiscount, clearDiscounts } = require("../../helpers/admin/discount");
const category_model = require("../../model/category_model");
const product_model = require("../../model/product_model");

module.exports = {
    getProductDiscount : (req,res) => {

        return new Promise((resolve,reject) => {
          product_model.find({isDelete:false}).then((data) => {
            category_model.find({isDelete:false}).then((categoryData)=> {
              console.log(categoryData);
              const cd = categoryData[0].cdiscount;
              console.log(cd);
              res.render("admin/discounts",{admin:true,products:data,category:categoryData})
            })
            resolve(data)
          })
        })
      
      },
      applydiscount :(req,res) => {
  
        console.log(req.body);
        applyDiscount(req.body).then((pdprice)=>{
          console.log(pdprice);
          res.status(200).json(pdprice);
        })
      },
      clearDiscount : (req,res)=> {
        console.log("started");
        console.log("her",req.body);
        clearDiscounts(req.body).then((result) => {
          console.log(result);
          res.status(200).json(result);
      
        })
      
      }
}