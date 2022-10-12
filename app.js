var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sessions = require('express-session')
const mongoose  = require('mongoose')
const User = require("./model/product_model")
const fileupload = require('express-fileupload')
const Joi = require('joi')
const referralCode = require('referral-code-generator')
require('dotenv').config()


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const { hasSubscribers } = require('diagnostics_channel');
const hbs = require('hbs')
var app = express();
var handlebars=require('express-handlebars');
const { token } = require('morgan');
var hbshelper=handlebars.create({});
hbshelper.handlebars.registerHelper('notEqual',function(string1,string2,options){
if(string1!=string2){
  return options.fn(this);
} else {
    return options.inverse(this);
}
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
 const partialsPath = path.join(__dirname,"./views/partials");
 hbs.registerPartials(partialsPath);
//  app.set("views",path.join(__dirname,"./views/partials"));

hbs.registerHelper('index_of', function(context,ndx,prop) {
  return context[ndx][prop];
});

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

  switch (operator) {
      case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
          return options.inverse(this);
  }
});


mongoose.connect( process.env.MONGODB_CONNECT).then((success) => {
  console.log('success')
}).catch((err) => {
  console.log(err)
})


hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())



const oneDay = 1000 * 60 * 24;
app.use(sessions({
  key:"user",
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767jg",
  saveUninitialized:true,
  cookie: { maxAge: oneDay },
  resave: false 
}));

console.log(mongoose.models)
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.get('/error',(req,res)=>{
   res.render('errorpage')
})
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (err.status === 400) {
    console.log("bad request")
    res.send("bad request")
  }
  if(err.status === 404) {
    
    res.render('errorpage');
  }
});

module.exports = app;
 