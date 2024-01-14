const mongoose=require("mongoose");
const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
        unique:true,
       lowercase:true//convert to lowercase before saving
    },
    categoryImage:{
        type:String,
        require:true
    }
},{timestamps:true});
const categoryModel=mongoose.model("Category",categorySchema);
module.exports=categoryModel;