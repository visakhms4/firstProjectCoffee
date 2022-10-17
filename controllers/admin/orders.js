const { get_Allorders, updateOrderStatus } = require("../../helpers/admin/orders");
const { get_order } = require("../../helpers/admin/order_details");
const { error } = require("../../helpers/user/joi");
const order_models = require("../../model/order_models");
const user_model = require("../../model/user_model");

module.exports = {
  get_order_table: function (req, res, next) {
    

    get_Allorders().then((orders) => {
      // let a = new Date().toISOString();
      // console.log("hi",a);

// Creating a Date object
const dateObj = new Date();

// Printing the date and time parts

console.log(`Time: ${dateObj.toISOString()}`);

      res.render("admin/order_details", { orders: orders, admin: true });
    });
  },
  getChangeOrderStatus: (req, res) => {
    const { orderId, productId, status } = req.body;
    updateOrderStatus(orderId, productId, status).then((orders) => {
      res.status(200).send("success");
    });
  },
  getCancelOrder: (req, res) => {
    const { orderId, productId } = req.params;
    updateOrderStatus(orderId, productId, "cancelled").then(() => {
      res.redirect(`/admin/order/details/${orderId}`);
    });
  },
  getCancelOrder: (req, res) => {
    const { orderId, productId } = req.params;
    updateOrderStatus(orderId, productId, "cancelled").then(() => {
      res.redirect(`/admin/order/details/${orderId}`);
    });
  },

  getOrderDetails :  function(req,res) {
    get_order(req.params.id).then((data) => {
    console.log(data[0]);
      res.render("admin/individual_orders",{admin : true, orderDetails: data[0]})
    }).catch((error) => {
      res.redirect("/error")
    })
    
    
    },
    getReport: ()=> {
      
    }
};


