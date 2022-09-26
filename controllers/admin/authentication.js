const id = "qwerty";
const pass = "qwerty";
const credentials = {
  id: "qwerty",
  pass: "qwerty"
}
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = {
  postLogin: function (req, res, next) {
    console.log(req.body);
    const { username, password } = req.body;
    if (username === id && password === pass) {
      //
      // req.session.admin = username;
      const token = jwt.sign(
        credentials,
        process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("adminToken", token);
      res.redirect("/admin");
      // res.redirect("/admin");
      // console.log(req.body);
    } else {
      res.send("error");
      console.log(req.body);
    }
  },
  getLogout: function (req, res, next) {
    res.clearCookie("adminToken")
    res.redirect("/admin");
  },
  adminAuth: (req, res, next) => {
    const token = req.cookies.adminToken;
    console.log("token", token);
    try {
      jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
        (err, user) => {
          if (err) {
            res.clearCookie("adminToken");
            res.redirect("/admin/login");
          } else {
            // req.user = user;
            next();
          }
        }
      );
    } catch (err) {
      res.clearCookie("adminToken");
      res.redirect("/admin");
    }
  },
  stopAuthenticate: (req, res, next) => {
    const token = req.cookies.adminToken;
    if (token) {
      jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
        (err, user) => {
          if (err) {
            res.clearCookie("adminToken");
            next();
          } else {
            res.redirect("/admin");
          }
        }
      );
    } else {
      next();
    }
  },
};
