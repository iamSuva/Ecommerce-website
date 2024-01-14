const mongoose=require("mongoose");
const commentSchema=new mongoose.Schema({
    comment:{
        type:String,
        require:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    commentedBy:{
        type:mongoose.Schema.Types.ObjectId,
       ref:"User"
    }
},{timestamps:true});

const commentModel=mongoose.model("comment",commentSchema);
module.exports=commentModel;

