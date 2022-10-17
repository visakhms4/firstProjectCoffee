const { token } = require("morgan");
const { getTotalAmount, updateUser } = require("../../helpers/common");
const { getPrintingDetails } = require("../../helpers/user/orders");
const { updatePassword, getAddress, addAddress } = require("../../helpers/user/users");
const address_model = require("../../model/address_model");
const user_model = require("../../model/user_model");
const { createInvoice } = require("./invoice");
const { getUserData } = require("./user");

module.exports = {
    get_profile :  function (req, res, next) {
        console.log(req.session.user.userId);
        const id = req.session.user.userId;
        getUserData(id).then((data) => {
          let user = token;
          console.log("data is",data);
          res.render("user/user_profile",{data : data,user : user})
        })
        
      
       // res.render("user/user_profile",{}) 
      },
     
      postAddress : (req, res) => {
        console.log(req.body)
        if(req.body.address === "address_not_selected"){
          res.status(400).json("Please select a address")
        } else {
          res.status(200).json(req.body.address)
        }
      },
      getInvoice : async (req,res) => {
        let orderDetails = await getPrintingDetails(req.params.id)
        console.log("like",orderDetails.products[0].productId);
        // let products = await getInvoiceproducts(orderDetails.products[0].productId)
        console.log("order is :",orderDetails)
        const { address,totalAmount,productDetails,products } = orderDetails
        console.log(address)
        console.log("my",productDetails);
        const addrs = `${address[0].houseName}, ${address[0].locality}`
        // const prdcts = `${productDetails[0].Product_name}, ${productDetails[0].description}`
        const invoice = {
          shipping: {
            name: address[0].name,
            address: addrs,
            city: address[0].city,
            state: address[0].city,
            country: "INR",
            postal_code: address[0].pincode
          }, 
          items: [
            {
              item:productDetails[0].Product_name ,
              description: productDetails[0].description,
              quantity: products[0].quantity,
              amount:productDetails[0].cd_price,
            },
            // {
            //   item: "USB_EXT",
            //   description: "USB Cable Extender",
            //   quantity: 1,
            //   amount: 2000
            // }
          ],
          subtotal: totalAmount,
          paid: totalAmount,
          invoice_nr: orderDetails._id
        }
        
      
         
      
          console.log("started");
        
          createInvoice(invoice, "invoice.pdf");
          console.log("ended");
          res.redirect("/");
       
      
      },
      getEditUser : (req,res) => {
        console.log("hll",req.session.user.userId);
        getUserData(req.session.user.userId).then((user) => {
          console.log(user);
          res.render("user/editprofile",{data:user})
        })
      
      
      },
      postEditUSer: (req,res) => {
        console.log("lrstdfhjgkhk",req.body);
        console.log(req.session.user.userId);
        const id = req.session.user.userId;
      updateUser(id,req.body).then((data)=> {
        console.log(data);
        res.redirect("/profile")
      })
      
      
      
      },
      getChangePassword : (req,res)=>{
        let user = token;
        res.render("user/changepassword",{ user:user})
      },
      postChangePassword : (req,res) => {
        console.log(req.session.user.userId);
        console.log(req.body);
      
        updatePassword(req.session.user.userId,req.body).then(() => {
      res.status(200).json("success")
      
        }).catch((err) => {
          console.log(err);
          res.status(401).json(err.message)
        })
      
      },
      getprofileDetails : (req, res) => {
        let User = req.session.user ? req.session.user : null;
         console.log(User);
        getTotalAmount(User.userId).then((total) => {
          getAddress(User.userId).then((address) => {
            console.log(address);
            let user = token
            
            res.render("user/profileAddress", {
              total: total,
              address: address,
              User: User,
              user:user,
            });
          });
        });
      },
      getProfileAddAddress :  (req,res) => {
        res.render("user/add_address")
      },
      postProfileAddAddress : (req, res) => {
        let user = req.session.user ? req.session.user : null;
        console.log("in address routerrrrrr",user)
        addAddress(req.body, user.userId).then((address) => {
          
          res.redirect("/addres");
        })},  
        removeProfileAddress : (id)=> {
          return new Promise((resolve,reject)=>{
            address_model.deleteOne({_id:id}).then((data)=>{
              console.log(data);
            })
            resolve()
          })

        }
     
}