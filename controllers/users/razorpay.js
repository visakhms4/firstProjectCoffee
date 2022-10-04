const { verifyPayment, changePaymentStatus } = require("../../helpers/user/users");

module.exports = {
    razorVerifyPayment : (req,res) => {
        console.log(req.body);
        console.log("hell");
        verifyPayment(req.body).then(() => {
          console.log("change");
          changePaymentStatus(req.body['order[receipt]']).then(()=> {
            console.log("payment successfull");
            res.json({status:true})
          }).catch((err) => {
            console.log(err);
            res.json({status:false})
          })
      
        })
        
      },
}