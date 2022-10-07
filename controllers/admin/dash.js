const { getAllCoupons, getTotalSalesAmount, getTotalUsers, getTotalSales } = require("../../helpers/admin/coupon")
const { getStatsWeek, getStatsMonth, getStatDay } = require("../../helpers/admin/dash")


module.exports = {
    weeklyChart : (req,res)=> {
        getStatsWeek().then((graph) => {
          res.status(200).json(graph)
        })
      },
      monthlyChart : (req,res)=> {
        getStatsMonth().then((graph) => {
          res.status(200).json(graph)
        })
      },
      dailyChart : (req,res)=> {
        getStatDay().then((graph) => {
          res.status(200).json(graph)
        })
      },
      dashboard:  async function(req, res, next) {

        let totalSales = await getTotalSales();
      let userCount = await getTotalUsers();
      let salesAmount = await getTotalSalesAmount();
      console.log("here",salesAmount);
      console.log(salesAmount[0]);
      console.log(salesAmount[0].total);
      
        
        res.render('./admin/admin_page',{admin:true,Sales:totalSales,users:userCount,amount:salesAmount[0].total})
        
        // if(req.session.admin) {
        //   console.log(req.session.admin);
          
        // }else{
      
        //   res.render('./admin/admin_login',{admin:true});
        //   console.log('started')
        // }
      },
   
}