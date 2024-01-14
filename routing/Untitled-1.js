const express=require("express");
const router=express.Router();
const path=require("path");
const multer=require("multer");
const CategoryModel=require("../models/categorySchema");
const productModel=require("../models/productSchema");
const categoryModel = require("../models/categorySchema");
const { appendFile } = require("fs");
//creating multer function
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.resolve("./public/products"));
    },
    filename:function(req,file,cb){
        const filename=`${Date.now()}-${file.originalname}`;
        cb(null,filename);
    }
});
const upload=multer({storage:storage});
router.get("/createProduct",async(req,res)=>{
  const categories=await categoryModel.find({});
    res.render("createProduct",{categories});
})
router.post("/createProduct",upload.single("productImage"),async(req,res)=>{
      console.log(req.body);
      console.log("file is "+req.file);
      try{
        const newproduct=await productModel({
          productName:req.body.productName,
          productPrice:req.body.productPrice,
          productDesc:req.body.productDesc,
          productImage:`products/${req.file.filename}`,
          category:req.body.category
       });
        await newproduct.save();
         res.redirect("/dashboard");
      }catch(err)
      {
        console.log(err);
        res.status(400).send("error in adding new product");
      }
  
});
router.get("/",async (req,res)=>{
  const categories=await categoryModel.find({});
  const products=await productModel.find({});//all products
  console.log(products);
  res.render("dashboard" ,{data:products,categories:categories});
})

//single product
router.get("/product/:id",async(req,res)=>{
    const pid=req.params.id;
    const singleproduct=await productModel.findById(pid);
  //  console.log(singleproduct);
    res.render("product",{data:singleproduct});
})
;
//delete singleproduct
router.delete("/product/delete/:id",async(req,res)=>{
    const pid=req.params.id;
    console.log(pid);
    try{
        const singleproduct=await productModel.findByIdAndDelete(pid);
        console.log("single product: ",singleproduct);
        if(!singleproduct)
        {
            res.status(404).send("product not found");
        }
        res.sendStatus(204); //req is processed successfully but no content will be sent 
    }catch(err)
    {
        console.log(err);
    }
});

//update single single product
//showing product
router.get("/product/update/:id",async(req,res)=>{
   const pid=req.params.id;
   try{
      const singleproduct=await productModel.findById(pid);
      res.render("updateProduct",{data:singleproduct});
   }catch(err)
   {
    console.log(err);
    res.status(500).send("Internal server error");
   }
});

router.post("/product/update/:id",upload.single('productImage'),async(req,res)=>{
     const pid=req.params.id;
     const {productName,productPrice,productDesc,currentImage}=req.body;
     try{
        let newProductImage = currentImage; // Use the existing image by default
          if(req.file)
          {
            newProductImage=`products/${req.file.filename}`;
          }
          await productModel.findByIdAndUpdate(pid,{
            productName,
            productPrice,
            productDesc,
            productImage:newProductImage
          });
          res.redirect(`/dashboard/product/${pid}?success==true`);
     }catch(err)
     {
        console.log(err);
        res.status(500).send("Internal server image");
     }
});

//showing product by category
router.get("/productsByCategory/:categoryId",async(req,res)=>{
   try{
    const categoryId=req.params.categoryId;
     //find the category with the id
     const category=await categoryModel.findById(categoryId);
     console.log(category)
    const categories=await categoryModel.find({});
     if(!category)
     {
       res.status(404).send("can not find category");
     }
      //now find all products according to categoryid
       const products=await productModel.find({category:categoryId});
      // console.log(products);
       res.render("dashboard",{category,data:products,categories});
       //res.json(products);
   }catch(err){
    res.status(400).send("can not find category");

   }
});
module.exports=router;