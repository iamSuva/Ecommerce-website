const mongoose=require("mongoose");
const wishlistSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    products:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }
    ],
},{timestamps:true});
const wishlistModel=mongoose.model("Wishlist",wishlistSchema);
module.exports=wishlistModel;