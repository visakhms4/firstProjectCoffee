const { promise } = require("bcrypt/promises");
const createHttpError = require("http-errors");
const { Types } = require("mongoose");
const category = require("../../controllers/admin/category");
const category_model = require("../../model/category_model");
const order_models = require("../../model/order_models");

module.exports = {
  addCategory: function (body) {
    console.log("in add category");
    console.log(body);
    return new Promise((resolve, reject) => {
      
      const { Name, description,cdiscount } = body;
      category_model
        .create({
          Category_name: Name,
          Category_description: description,
          cdiscount:cdiscount,
          isDelete: false,
        })
        .then((state) => {
          console.log("success category added");
          resolve(state);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  get_category_by_category_name: (category_name) => {
    return new Promise((resolve, reject) => {
      let regex = new RegExp(["^", category_name, "$"].join(""), "i")
      category_model.findOne({Category_name : regex}).then((category) => {
        if(category) { 
          reject(createHttpError.Conflict("Category name must be unique"))
        } else {
          resolve()
        }
      })
    })
  },
  get_category: (id) => {
    return new Promise((resolve, reject) => {
      try {

        console.log(id);
        category_model
          .findOne({ _id: Types.ObjectId(id) })
          .then((showcategory) => {
            console.log(showcategory);
            resolve(showcategory);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch(error) {
        reject(error)
      }
    });
  },
  update_category : (id,body) => {
    const { Name,description,cdiscount } = body;
    //cdiscount = parseInt(cdiscount)
    console.log(cdiscount)
      
    return new Promise((resolve,reject) => {
        category_model.updateOne(
            { _id: Types.ObjectId(id)},
            {
                $set: {
                    Category_name : Name,
                    Category_description : description,
                    cdiscount:cdiscount,
                },
            }
        ).then((result) => {
            resolve(result);
        })
    });
  },
     
    };
