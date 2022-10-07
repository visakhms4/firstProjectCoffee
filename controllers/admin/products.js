const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const { addProduct, updateProduct } = require("../../helpers/admin/product");
const { getProduct } = require("../../helpers/common");
const category_model = require("../../model/category_model");
const product_model = require("../../model/product_model");

module.exports = {
  dispay_products: function (req, res, next) {
    product_model.find({isDelete : false}).then((data) => {
      res.render("admin/display_products", { admin: true, products: data });
    });
  },
  add_product: function (req, res, next) {
    category_model.find({isDelete : false}).then((data) => {

      res.render("admin/add-product", {data :data, admin: true });
    })
  },
  post_addProduct: function (req, res, next) {
    console.log(req.body);
    let {price, pdiscount} = req.body
    req.body.pd_price = parseInt(price - (pdiscount * price) / 100)
    addProduct(req.body).then((result) => {
      console.log(req.file);
      if(req.files) {
        var image = req.files.image;
      image.mv(`./public/product_images/${result._id}.jpg`, (err, done) => {
        if (!err) res.redirect("/admin/products");
        else console.log(err);
      });
      } else {
        res.redirect("/admin/products")
      }
    });
  }, 

  delete_product: function (req, res, next) { 
   

    product_model.updateOne({ _id: Types.ObjectId(req.params.id) },{$set : {isDelete : true}}).then(() => {
      res.redirect("/admin/products");
    });
  },
  
  getEditProduct: (req, res) => {
    try {
    getProduct(req.params.id).then((result) => {
      
      
      if (result) {
        res.render("admin/edit_product", { admin: true, product: result });
      } else {
        res.send("Unable to find a product"); 
      }
      
    }).catch((err)=>{res.redirect('/error')});
  } catch(error) {
    res.redirect("/error")

  }
  },
  postEditProduct: (req, res) => {
    let {price, pdiscount} = req.body
    req.body.pd_price = parseInt(price - (pdiscount * price) / 100);
    updateProduct(req.params.id, req.body).then((result) => {
      console.log(result);
      if (result) {
        // if image is changed add new image to the folder
        if (req.files) {
          const image = req.files.image;
          image.mv(
            `./public/product_images/${req.params.id}.jpg`,
            (err, done) => {
              if (!err) res.redirect("/admin/products");
              else console.log(err);
            }
          );
        }
        //if image not changed redirect to products
        else {
          res.redirect("/admin/products");
        }
      } else {
        res.send("Unable to complete your request");
      }
    });
  },
};

// const fs = require("fs");
// const path = require("path");
// const { getAllCategories } = require("../../helpers/admin/categories");
// const {
//   AddProduct,
//   deleteProduct,
//   updateProduct,
// } = require("../../helpers/admin/products");
// const { getAllProducts, getProduct } = require("../../helpers/common");
// module.exports = {
//   getProducts: (req, res) => {
//     getAllProducts().then((products) => {
//       res.render("admin/view_products", { admin: true, products: products });
//     });
//   },
//   getAddProducts: (req, res) => {
//     getAllCategories().then((categories) => {
//       console.log(categories);
//       res.render("admin/add_product", { admin: true, categories: categories });
//     });
//   },
//   postAddProducts: (req, res) => {
//     const img_ext = req.files.image.name.split(".").pop(); // to get the extension of the file
//     AddProduct(req.body, img_ext).then((result) => {
//       console.log(result);
//       if (result) {
//         const image = req.files.image;
//         image.mv(
//           `./public/product_images/${result._id}.${result.img_ext}`, // adding image of product to the product images file
//           (err, done) => {
//             if (!err) res.redirect("/admin/products");
//             else console.log(err);
//           }
//         );
//       } else {
//         console.log("error");
//       }
//     });
//   },
//   deleteProduct: (req, res) => {
//     getProduct(req.params.id).then((result) => {
//       console.log(result);
//       fs.unlinkSync(
//         path.join(
//           __dirname,
//           `../../public/product_images/${req.params.id}.${result.img_ext}`
//         )
//       );
//     });
//     deleteProduct(req.params.id).then((result) => {
//       if (result) {
//         res.redirect("/admin/products");
//       } else {
//         res.send("something went wrong");
//       }
//     });
//   },
  
// };
