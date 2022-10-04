const { cancelOrders } = require("../../helpers/user/orders")

module.exports = {
    getPaypalOrder : (req,res)=>{
        cancelOrders(req.params.orderId,req.params.productId).then(()=>{
          res.redirect("/")
        })
      },
      
}