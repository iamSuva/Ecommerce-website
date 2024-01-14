const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const CategoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");
const wishlistModel = require("../../models/wishlistModel");
const cartModel = require("../../models/cartModel");
const commentModel = require("../../models/comment");
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

//route--Home
router.get("/", async (req, res) => {
  const userData = req.session.userData;
  // console.log("session data in dashborad: ",userData);
  const categories = await categoryModel.find({});
  const products = await productModel.find({});//all products
  // console.log(products);
  res.render("home", { products, categories, userData });
})
//

//single product
router.get("/product/:id", async (req, res) => {
  const pid = req.params.id;
  const singleproduct = await productModel.findById(pid);
  const error = req.session.error;
  //  console.log(singleproduct);
  req.session.error = null;
//  console.log("single=> " +singleproduct);
  const allcomments=await commentModel.find({productId:pid}).populate("commentedBy");
  console.log("comments ",allcomments);
  res.render("singleproduct", { data: singleproduct, userData: req.session.userData, error,comments:allcomments });
});
//shwoing according to category
router.get("/productsByCategory/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    //find the category with the id
    const category = await categoryModel.findById(categoryId);
    console.log(category)
    const categories = await categoryModel.find({});
    if (!category) {
      res.status(404).send("can not find category");
    }
    //now find all products according to categoryid
    const products = await productModel.find({ category: categoryId });
    // console.log(products);
    res.render("home", { category, products, categories, userData: req.session.userData });
    //res.json(products);
  } catch (err) {
    res.status(400).send("can not find category");

  }
});

//search product by name
router.post("/search", async (req, res) => {
  try {
    const { prodname } = req.body;
    const products = await productModel.find({ productName: { $regex: new RegExp(prodname, 'i') } });
    console.log("search products : " + products);

    const userData = req.session.userData;
    // console.log("session data in dashborad: ",userData);
    //const categories = await categoryModel.find({});
//const products = await productModel.find({});//all products
    // console.log(products);
    res.render("searchpage", { products, userData });
    // if (searchproducts) {

    //   res.json(searchproducts);
    // }

  } catch (error) {
    console.log(error);
  }
});
//showing product by category


//ordering routes in

module.exports = router;