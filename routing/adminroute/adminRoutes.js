const express=require("express");
const router=express.Router();

const path = require("path");
const multer = require("multer");
const CategoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");
const wishlistModel = require("../../models/wishlistModel");
const cartModel = require("../../models/cartModel");
//creating multer function
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/products"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });
//end of multer code
//dashboard route--Home
router.get("/", async (req, res) => {
  const userData = req.session.userData;
  // console.log("session data in dashborad: ",userData);
  const categories = await categoryModel.find({});
  const products = await productModel.find({});//all products
  // console.log(products);
  res.render("admin/admindashboard", {products,categories, userData });
})

router.get("/addProduct", async (req, res) => {
  const userData = req.session.userData;
  // console.log("session in createdprod => ",req.session.userData);
  const categories = await categoryModel.find({});
  res.render("admin/createProduct", { categories, userData });
})
router.post("/addProduct", upload.single("productImage"), async (req, res) => {
  //  console.log(req.body);
  //  console.log("file is "+req.file);
  try {
    const newproduct = await productModel({
      productName: req.body.productName,
      productPrice: req.body.productPrice,
      productDesc: req.body.productDesc,
      productImage: `products/${req.file.filename}`,
      category: req.body.category
    });
    await newproduct.save();
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.status(400).send("error in adding new product");
  }

});


//single product
router.get("/product/:id", async (req, res) => {
  const pid = req.params.id;
  const singleproduct = await productModel.findById(pid);
  const error=req.session.error;
  //  console.log(singleproduct);
  req.session.error=null;
  res.render("admin/singleproduct", { data: singleproduct, userData: req.session.userData,error });
})
  ;
//delete singleproduct
router.delete("/product/delete/:id", async (req, res) => {
  const pid = req.params.id;
  //console.log(pid);
  try {
    const singleproduct = await productModel.findByIdAndDelete(pid);
    console.log("single product: ", singleproduct);
    if (!singleproduct) {
      res.status(404).send("product not found");
    }
    res.sendStatus(204); //req is processed successfully but no content will be sent 
  } catch (err) {
    console.log(err);
  }
});

//update single single product
//showing product
router.get("/product/update/:id", async (req, res) => {
  const pid = req.params.id;
  try {
    const singleproduct = await productModel.findById(pid);
    res.render("admin/updateProduct", { data: singleproduct });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

router.post("/product/update/:id", upload.single('productImage'), async (req, res) => {
  const pid = req.params.id;
  const { productName, productPrice, productDesc, currentImage } = req.body;
  try {
    let newProductImage = currentImage; // Use the existing image by default
    if (req.file) {
      newProductImage = `products/${req.file.filename}`;
    }
    await productModel.findByIdAndUpdate(pid, {
      productName,
      productPrice,
      productDesc,
      productImage: newProductImage
    });
    res.redirect(`/admin/product/${pid}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server image");
  }
});

const orderModel=require("../../models/orderModel");
router.get("/allorder",async(req,res)=>{
  try {
    const allorders=await orderModel.find({});
    console.log("allorders: ",allorders);
    res.render("admin/orderdetails",{allorders});
  } catch (error) {
    console.log(error);
  }
})


module.exports=router;