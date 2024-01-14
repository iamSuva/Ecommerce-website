const { Timestamp } = require("mongodb");
const mongoose=require("mongoose");
const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true,

    },
    productPrice:{
        type:String,
        required:true
    },
    productDesc:{
        type:String,
        required:true,
    },
    productImage:{
        type:String,
        required:false
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
     }
},{timestamps:true});

const productModel=mongoose.model("Product",productSchema);

module.exports=productModel;