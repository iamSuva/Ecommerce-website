// const { Timestamp } = require("mongodb");
const mongoose=require("mongoose");
const adminSchema=mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        unique:true,
        require:true
    },
    role:{
        type:String,
        default:"user",
       
    },
    password:{
        type:String,
        
    }
},{timestamps:true});

const userModel=mongoose.model("User",adminSchema);
module.exports=userModel;