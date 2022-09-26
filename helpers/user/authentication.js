// const { db } = require("../../config/connection");
const bcrypt = require("bcrypt");
const user_model = require("../../model/user_model.js");

module.exports = {
  doSignUp: (data) => {
    let { name, email, phone, password } = data;
    data.email = data.email.toLowerCase();
    return new Promise(async (resolve, reject) => {
      let response = {};
      user_model.findOne({ User_PhoneNumber: data.phone }).then((dbValue) => {
        console.log(dbValue);
        if (dbValue) {
          response.status = false;
          response.error = "phone already registered";
          resolve(response);
        } else {
          bcrypt.hash(data.password, 10).then((result) => {
            password = result;
            delete data.confirmPassword;
            user_model
              .create({
                User_name: name, 
                User_email: email,
                User_PhoneNumber: phone,
                User_Password: password,
                isAllowed: true,
                isDelete : false,
              })
              .then((result) => {
                console.log(result);
                response.result = result.insertedId;
                response.status = true;
                resolve(response);
              });
          });
        }
      });
    });
  },
  doSignIn: (data) => {
    return new Promise(async (resolve, reject) => {
      data.email = data.email.toLowerCase();
      let loginStatus = false;
      let response = {};
      user_model.findOne({ User_email: data.email }).then((user) => {
        if (user) {
          if (!user.isAllowed) {
            response.status = false;
            response.blocked = true;
            // console.log('blocked')
            resolve(response);
          } else {
            bcrypt.compare(data.password, user.User_Password).then((status) => {
              if (status) {
                console.log("Login Success");
                response.user = user;
                response.status = true;
                resolve(response);
              } else {
                response.status = false;
                response.error = "Incorrect password";
                console.log("Login Failed");
                resolve(response);
              }
            });
          }
        } else {
          response.error = "User not found";
          console.log("Login Failed");
          resolve(response);
        }
      });
    });
  },
  getUser: (phone) => {
    return new Promise((resolve, reject) => {
      console.log(phone)
      user_model.findOne({ User_PhoneNumber: phone,isDelete:false }).then((user) => {
        if (user) {
          console.log(user);
          resolve(user);
        } else {
          console.log("false no user found")
          resolve(false);
        }
      });
    });
  },
};
