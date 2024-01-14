const express=require("express");
const router=express.Router();
const multer=require("multer");
const CategoryModel=require("../../models/categoryModel");
const ProductModel=require("../../models/productModel");
const storage=multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,"./public/category");
    },
    filename:function(req,file,cb){
        const name=`${Date.now()}-${file.originalname}`
        cb(null,name);
    }
});
const upload=multer({storage:storage});
router.get("/addCategory",(req,res)=>{
    const userData=req.session.userData;
    res.render("admin/addcategory",{userData});
});
router.post("/addCategory",upload.single("categoryImage"),async(req,res)=>{
    ///console.log(req.file);
    //console.log(req.body);
    const {categoryName}=req.body;
    const categoryImage=req.file.filename;
    try{
        const existCat=await CategoryModel.findOne({"categoryName":categoryName.toLowerCase()});
        console.log(existCat);
       if(existCat)
       {
        console.log("category with same name exists");
        // res.status(201).send("already exists");
        res.redirect("/admin/addCategory");
       }else
       {

           //create a new cat
           const category=new CategoryModel({
               categoryName,
               categoryImage
            });
            
            await category.save();
           
            res.redirect("/admin");
        }
    }
    catch(err){
        console.log(err);
        res.status(400).send("error");
    }
   
});
router.get("/productsByCategory/:categoryId", async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      //find the category with the id
      const category = await CategoryModel.findById(categoryId);
      console.log("searching category:"+category)
      const categories = await CategoryModel.find({});
      if (!category) {
        console.log("noooooooo");
        res.status(404).send("can not find category");
      }
      //now find all products according to categoryid
      const products = await ProductModel.find({ category: categoryId });
      console.log(products);
      res.render("admin/admindashboard", { category, products, categories,userData:req.session.userData });
      //res.json(products);
    } catch (err) {
      res.status(400).send("can not find category");
  
    }
  });
module.exports=router;