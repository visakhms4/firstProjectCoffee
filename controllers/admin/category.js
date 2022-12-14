const { Types } = require("mongoose");
const { addCategory, get_category, update_category, get_category_by_category_name } = require("../../helpers/admin/category");
const { find_category_discount } = require("../../helpers/admin/product");
const category_model = require("../../model/category_model");

module.exports = {
  add_category: function (req, res, next) {
    category_model.find({isDelete : false}).then((data) => {
      res.render("admin/category", { admin: true, category: data });
    });
  },
  post_add_category: async function (req, res, next) {
    try{
      // console.log(req.body); 
    let category = await get_category_by_category_name(req.body.Name)
    addCategory(req.body).then((result) => {
      if (result) res.status(200).json("Success")
      else res.send("some error occured");
    });
    } catch (err) {
      res.status(err.status).json(err.message)
    }
  },
  get_delete_category: function(req,res,next) {
    // category_model.deleteOne({_id: Types .ObjectId(req.params.id)}).then(() => {
    //   res.redirect("/admin/category")
    // })
    category_model.updateOne({_id: Types .ObjectId(req.params.id)},{$set : {isDelete : true}}).then(() => {
      res.redirect("/admin/category")
    })
  },edit_category : function(req,res,next){
    
    get_category(req.params.id).then((result) => {
      console.log(result)
        res.render("admin/edit_category",{admin:true,category : result})
  
      
    }).catch((error) => {
      res.redirect("/error")
    })
  },post_edit_category : function(req,res,next){
    console.log("edit started");
    update_category(req.params.id,req.body).then((result) => {
      console.log(result);
      find_category_discount(req.params.id,req.body)
      res.redirect("/admin/category")
    })
  },
};
