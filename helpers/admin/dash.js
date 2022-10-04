const order_models = require("../../model/order_models");

module.exports = {
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
            $sort: {date: 1} 
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
      }, 
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
            $sort: {date: 1} 
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

}