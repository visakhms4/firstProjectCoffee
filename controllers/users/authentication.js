const { response } = require("express");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();
const {
  doSignUp,
  doSignIn,
  getUser,
  validateReferralCode,
} = require("../../helpers/user/authentication");
const { schema } = require("../../helpers/user/joi");
const Joi = require('joi');
const { token } = require("morgan");
const user = require("./user");
const session = require("express-session");

let joiSchema = Joi.object({
  name: Joi.string().min(2).alphanum().required(),
  email:Joi.string().email().required(),
  phone:Joi.number().min(10).required(),
  password:Joi.string().min(8).required(),
  confirmPassword:Joi.string().min(8).required(),
})


require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
module.exports = {
  userAuth: (req, res, next) => {
    const token = req.cookies.token;
    console.log("token", token);
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("token");
          res.redirect("/signin");
        } else {
          //req.user = user;
          console.log("user is : ", user);

          let userObj = {
            username: user.User_name,
            userId: user._id,
          };
          console.log("user obj is : ", userObj);
          req.session.user = userObj;
          next();
        }
      });
    } catch (err) {
      res.clearCookie("token");
      res.redirect("/");
    }
  },
  stopAuthenticate: (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("token");
          next();
        } else {
          res.redirect("/");
        }
      });
    } else {
      next();
    }
  },
  getSignIn: (req, res) => {
    res.render("user/signin", {
      title: "User Signin",
      noHeader: true,
    });
  },
  
  getSignUp: (req, res) => {
    let Err = "";
    if(req.session?.signupErr){
      Err = req.session.signupErr
    }

      res.render("user/signUp", {
        title: "User Signup",
        noHeader: true,
        Err: Err
      });
      req.session.signupErr = null;
    
    
  },
  postSignIn: (req, res) => {
    doSignIn(req.body).then((response) => {
      if (response.status) {
        console.log(typeof response);
        
      
        const token = jwt.sign(
          response.user.toJSON(),
          process.env.ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: "7d" }
        );
        res.cookie("token",token);
       

        res.redirect("/");
      } else {
        console.log(response);
        if (response.blocked) {
          console.log("blocked");
          res.status(404).send({ message: "You are Blocked by the admin" });
        } else {
          console.log("notblocked");
          res.status(404).send({ message: response.error });
        }
        // req.session.loginErr = "Username or password incorrect";
        // res.redirect("/login");
      }
    });
  },
  postSignUp: (req, res) => {
    console.log("in signup route")
    let valid = joiSchema.validate({ name:req.body.name,email:req.body.email,phone:req.body.phone,password:req.body.password,confirmPassword:req.body.confirmPassword})
    console.log ("valid",valid)
    if(valid.error) {
      req.session.signupErr = valid.error.details[0].message
      res.redirect("/signup")
    }else {
      doSignUp(req.body).then((response) => {
        console.log(response);
        validateReferralCode(req.body.referalCode);
        if (response.status) {
          res.status(200).redirect("/signin");
        } else {
          res.status(404).send({ message: response.error });
        }
      });
    }
  },
  getBlocked: (req, res) => {
    res.render("user/authentication/blocked");
  },
  getOtpSigninPage: (req, res) => {
    res.render("user/authentication/otp_signin", { noHeader: true });
  },
  postGetOtp: (req, res) => {
    const { phone } = req.body;
    setTimeout(() => {
      OTP = generateOTP();
    }, 300000);
    OTP = generateOTP();
    console.log(OTP);
    const client = new twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    getUser(phone).then((user) => {
      if (user) {
        client.messages
          .create({
            body: `Hey Welcome to  your otp for login is : ${OTP}`,
            to: `+91${phone}`,
            from: process.env.TWILIO_PHONE,
          })
          .then((message) => {
            console.log(message.sid);
            res.status(200).send({ message: "Otp send successfully" });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        res.status(404).send({ message: "No user with this phone number" });
      }
    });
  },
  postVerifyOtp: (req, res) => {
    const { otp, phone } = req.body;
    client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: `+91${req.cookies.phone.phone}`,
        code: req.body.otp,
      })
      .then((verification_check) => {
        console.log(verification_check.status);
        if (verification_check.status === "approved") {
          getUser(req.cookies.phone.phone).then((user) => {
            if (user) {
              console.log(user);
              const token = jwt.sign(
                user.toJSON(),
                process.env.ACCESS_TOKEN_SECRET_KEY,
                { expiresIn: "7d" }
              );
              res.cookie("token",token);
              res.redirect("/");
            } else {
              res.send({ message: "NO user with this phone number" });
            }
          });
        } else {
          res.redirect("/signin");
        }
      });
  },
  getLogout: (req, res) => {
    res.clearCookie("token");
    console.log("hello");
  
    
    res.redirect("/");
  },
  post_otp_login :  function (req, res, next) {
    res.cookie("phone", { phone: req.body.phone }, { maxAge: 5 * 60 * 1000 });
    client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: `+91${req.body.phone}`, channel: "sms" })
      .then((verification) => {
        console.log(verification.status);
        res.redirect("/verifyOtp");
      });
  }
};
