const { promise } = require("bcrypt/promises");
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
  get_category: (id) => {
    return new Promise((resolve, reject) => {
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
      getStatsWeek: (timestamp) => { 
        console.log("ki",timestamp);
        return new Promise((resolve, reject) => { 
          timestamp = "$"+timestamp; 
          console.log("mi",timestamp); 
          order_models.aggregate([ 
            { $group: { 
              _id: { 
                $add: [ 
                 { $week: "$date"},  
                 { $multiply:  
                   [400, {$year: "$date"}] 
                 } 
              ]},    
              totalAmount: { $sum: "$totalAmount" }, 
              date: {$min: "$date"} 
            } 
          }, 
          { 
            $sort: {date: -1} 
          }, 
          { 
            $limit: 14, 
          } 
          ]).then((data) => { 
            let date =[] 
            let totalAmount =[] 
            data.forEach((item) => { 
              date.push(item.date.toDateString()) 
              totalAmount.push(item.totalAmount) 
            }) 
            data = {date : date, totalAmount: totalAmount} 
            console.log(data) 
            resolve(data); 
          }) 
        }) 
      } ,
      getStatsMonth: (timestamp) => { 
        return new Promise((resolve, reject) => { 
          timestamp = "$"+timestamp; 
          console.log(timestamp); 
          order_models.aggregate([ 
            { $group: { 
              _id: { 
                $add: [ 
                 { $month: "$date"},  
                 { $multiply:  
                   [400, {$year: "$date"}] 
                 } 
              ]},    
              totalAmount: { $sum: "$totalAmount" }, 
              date: {$min: "$date"} 
            } 
          }, 
          { 
            $sort: {date: -1} 
          }, 
          { 
            $limit: 14, 
          } 
          ]).then((data) => { 
            let date =[] 
            let totalAmount =[] 
            data.forEach((item) => { 
              date.push(item.date.toDateString()) 
              totalAmount.push(item.totalAmount) 
            }) 
            data = {date : date, totalAmount: totalAmount} 
            console.log(data) 
            resolve(data); 
          }) 
        }) 
      } ,
      getStatDay: (timestamp) => { 
        return new Promise((resolve, reject) => { 
          timestamp = "$"+timestamp; 
          console.log(timestamp); 
          order_models.aggregate([ 
            { $group: { 
              _id: { 
                $add: [ 
                 { $dayOfYear: "$date"},  
                 { $multiply:  
                   [400, {$year: "$date"}] 
                 } 
              ]},    
              totalAmount: { $sum: "$totalAmount" }, 
              date: {$min: "$date"} 
            } 
          }, 
          { 
            $sort: {date: -1} 
          }, 
          { 
            $limit: 14, 
          } 
          ]).then((data) => { 
            let date =[] 
            let totalAmount =[] 
            data.forEach((item) => { 
              date.push(item.date.toDateString()) 
              totalAmount.push(item.totalAmount) 
            }) 
            data = {date : date, totalAmount: totalAmount} 
            console.log(data) 
            resolve(data); 
          }) 
        }) 
      } 
    };
