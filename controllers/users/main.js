
const { getAllProducts, getProduct, getProductLimit } = require("../../helpers/common");

module.exports = {
  getHome: (req, res) => {
    console.log(req.user);
    getProductLimit(3).then((products) => {
      let user = "data"
      console.log(user)
      res.render("user/index", { title: "Coffe Time", products: products, user:user});
    });
  },
  getProductPage: (req, res) => {
    getProduct(req.params.id).then((product) => {
      res.render("user/product_detail_view", { product: product })
    })
  }
}; 
 