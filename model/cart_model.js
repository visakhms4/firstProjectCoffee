const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
  },
  cartItems: {
    type: Array,
    //required: true
  },
  cartTotalAmount : {
    type:Number,
  }
});

module.exports = mongoose.model("cart_model", cartSchema,);
