const mongoose=require("mongoose");
const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    cartproducts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }
    ]
},{timestamps:true});
const cartModel=mongoose.model("Cartproduct",cartSchema);
module.exports=cartModel;