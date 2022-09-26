const { Types } = require("mongoose");
const product_model = require("../../model/product_model");

module.exports = {
  addProduct: function (body) {
    console.log("body");
    return new Promise((resolve, reject) => {
   
      const { name, description, rating, category, price, pd_price,pdiscount } = body;
      product_model
        .create({
          Product_name: name,
          description: description,
          Rating: rating,
          Category: category,
          Price: Number(price),
          pdiscount:Number(pdiscount),
          pd_price:Number(pd_price),
          cd_price:pd_price,
          isDelete : false, 
        })
        .then((state) => { 
          console.log(state);
          resolve(state);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  updateProduct: (productId, body) => {
    const { name, description, rating, category, price,pdiscount,pd_price } = body;
    return new Promise((resolve, reject) => {
      product_model.updateOne(
        { _id: Types.ObjectId(productId) },
        {
          $set: {
            Product_name: name,
            description: description,
            Rating: rating,
            Category: category,
            Price: Number(price),
            pd_price:pd_price,
            pdiscount:Number(pdiscount),
          },
        }
      ).then((result) => {
        resolve(result);
      })
    });
  },
  find_category_discount:(id,body)=>{
    console.log("price Updation");
    console.log(body);
    const { cdiscount,Name } = body;
    console.log(Name);
    return new Promise((resolve,reject) =>{
      product_model.find({Category:Name})
    .then((data)=>{
      console.log(data);
    data.forEach(element => {
      
   let cd_price =Math.floor(element.pd_price-(element.pd_price*cdiscount/100)) 
      console.log(cd_price);
      console.log(cdiscount);
      product_model.updateOne({_id:element._id},{$set:{cd_price:cd_price}}).then((resolve)=>{
        console.log(resolve);
      })
        
      });
    })})

  },
};
