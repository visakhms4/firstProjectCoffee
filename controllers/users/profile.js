const user_model = require("../../model/user_model");
const { getUserData } = require("./user");

module.exports = {
    get_profile :  function (req, res, next) {
        console.log(req.session.user.userId);
        const id = req.session.user.userId;
        getUserData(id).then((data) => {
          let user = req.token;
          console.log("data is",data);
          res.render("user/user_profile",{data : data,user : user})
        })
        
      
       // res.render("user/user_profile",{}) 
      },
      updateUser:(id,body)=> {

        const { Username,Email,number } = body;
        console.log(body);
        return new Promise((resolve,reject) => {
          user_model.updateOne(
            {
              _id :id 
            },
            {
              $set: {
                User_name : Username,
                User_email : Email,
                User_PhoneNumber : number,
              },
            }
          ).then((result) => {
            resolve(result)
          })
        })
      }
}