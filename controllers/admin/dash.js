const { getAllCoupons } = require("../../helpers/admin/coupon")
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
   
}