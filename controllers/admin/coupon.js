const { getAllCoupons, getEditCoupons, EditCoupons, deleteCoupon, addCoupon, postEditCoupon, posteditCoupon } = require("../../helpers/admin/coupon")

module.exports = {
    displayCoupon : (req, res) => {
        getAllCoupons().then((coupon) => {
          res.render("admin/view_coupons", {coupon: coupon})
        })
      },
      getAddCoupon : (req, res) => {
        console.log("coupon add")
        addCoupon(req.body).then(() => {
          res.redirect("/admin/coupon")
        })
      },
      getdeleteCoupon : (req,res)=> {
        console.log("delete coupon");
        console.log(req.params.id);
      
        deleteCoupon(req.params.id).then((data)=>{
          console.log(data);
          res.redirect("/admin/coupon")
        })
      },
      getEditCoupon : (req,res) => {
        console.log("started");
        EditCoupons(req.params.id).then((data)=> {
          console.log(data);
      
          res.render("admin/editcoupon",{coupon:data,admin:true})
        })
      
      }, 
      postECoupon : (req,res) => {
        console.log(req.body);
      
        posteditCoupon(req.params.id,req.body);
        console.log("hey");
        res.redirect("/admin/coupon")
      
      
      }
}