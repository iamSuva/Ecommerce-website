const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userMobile:{
    type:String,
    required:true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  orderedProductId:
   
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required:true
    },
    quantity:{
      type:Number,
      required:true
    
  }
  ,
  totalPrice: {
    type: String,
    required: true,

  }
   

});
const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;