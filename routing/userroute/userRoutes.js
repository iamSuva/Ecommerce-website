const express=require("express");
const router=express.Router();
const productModel=require("../../models/productModel");
const categoryModel=require("../../models/categoryModel");
const wishlistModel=require("../../models/wishlistModel");
const cartModel=require("../../models/cartModel");
const orderModel = require("../../models/orderModel");
const commentModel=require("../../models/comment");
//user routes
router.get("/",async(req,res)=>{
  try {
    const userData = req.session.userData;
    console.log("session data in dashborad: ",userData);
    const categories = await categoryModel.find({});
    const products = await productModel.find({});//all products
    // console.log(products);


    res.render("user/userhome", { products, categories: categories, userData });
} catch (err) {
    console.log(err);
}


})
//showing single product 
router.get("/product/:id", async (req, res) => {
  const pid = req.params.id;
  const singleproduct = await productModel.findById(pid);
  const error=req.session.error;
    console.log("single=> " +singleproduct);
const allcomments=await commentModel.find({"productId":pid}).populate("commentedBy");
    console.log("comments are ",allcomments);
  req.session.error=null;
  res.render("user/singleproduct", { data: singleproduct, userData: req.session.userData,error,comments:allcomments });
});
//showing wishlist element 
router.get("/wishlist", async (req, res) => {
  const { userData } = req.session;
  try {
    const wishlist = await wishlistModel.findOne({ "user": userData._id }).populate("products");

    //console.log("wishlists=> " + wishlist);
    res.render("user/wishlistpage", { wishlist, userData: req.session.userData });
    // res.json(wishlist);
  } catch (err) {
    console.log(err);
  }
});
//add to wishlist
router.post("/addtoWishlist/:id", async (req, res) => {
  try {
   console.log("add to list req is made");
    const productId = req.params.id;
   // console.log(productId);
    const userData = req.session.userData;
    //check if product is already present in wishlist
    const wishlist = await wishlistModel.findOne({ "user": userData._id });
    if (wishlist && wishlist.products.includes(productId)) {
        //  res.sendStatus(400);
      // // res.status(400).json({ message: 'Product is already in your wishlist.' });
     return res.redirect("/user/wishlist");
    }
    //add to wishlist
    if (!wishlist) {
      //create a wishlist if not exist
      const newWishlist = new wishlistModel({
        user: userData._id,
        products: [productId]
      })
      await newWishlist.save();

    } else {
      //add product to existing list
      wishlist.products.push(productId);
      await wishlist.save();
    }
    //res.sendStatus(200);
    // res.status(200).json({ message: 'Product added to your wishlist.' });
    res.redirect("/user/wishlist");
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "error in adding product" })
  }
});

//remove product from wishlist
router.post("/wishlist/remove/:id",async(req,res)=>{
  try {
    const pid = req.params.id;
    const userData = req.session.userData;
    const wishlist = await wishlistModel.findOne({ user: userData._id });
    if (wishlist) //if wishlist found
    {
      wishlist.products = wishlist.products.filter((productid) => productid.toString() !== pid);
      await wishlist.save();
      console.log("remove from wishlist");
      res.redirect("/user/wishlist");
    } else {
      res.status(400).json({ message: "wishlist not found" });
    }
  } catch (err) { console.log(err) };
});

//cart products showing

router.get("/cartlist", async (req, res) => {
    try {
      const { userData } = req.session;
      const cartlist = await cartModel.findOne({ "user": userData._id }).populate("cartproducts");
     let totalPrice=0;
      if(cartlist && cartlist.cartproducts.length>0)
      {
        cartlist.cartproducts.forEach((product)=>{
          totalPrice=totalPrice+parseInt(product.productPrice);
        })

      }
      console.log("cart list" + cartlist);
      // res.send("cart page");
      res.render("user/cartlistpage", { cartlist, userData,totalPrice })
  
    } catch (err) {
      console.log(err);
    }
});

//add to cart
router.post("/addtoCart/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const productid = req.params.id;
    const { userData } = req.session;
    const cartList = await cartModel.findOne({ "user": userData._id });
    console.log(cartList);
    //checking if product present in cart
    if (cartList && cartList.cartproducts.includes(productid)) {
      req.session.error = "Product already added to cart";
      res.redirect(`/user/product/${productid}`);
      // return  res.status(400).send("product is present in cart already.");
    }
    //if cart is epmty
    else {

      if (!cartList) {
        const newcartItem = new cartModel({
          user: userData._id,
          cartproducts: [productid]
        });
        //now save it
        await newcartItem.save();
      } else {
        //if cart is not empty
        cartList.cartproducts.push(productid);
        await cartList.save();
        console.log("save to cart");
      }
     // res.session.successmsg="Product has been added";
      res.redirect("/user/cartlist");
      //  res.send("added to cart");
    }
  } catch (err) {
    console.log(err);
  }
});

//deleteing product from 
router.post("/cartlist/delete/:id",async(req,res)=>{
  try{
      const pid=req.params.id;
      const {userData}=req.session;
      const cardlist=await cartModel.findOne({"user":userData._id});
      if(cardlist)
      {
          cardlist.cartproducts=cardlist.cartproducts.filter((product)=> product.toString()!==pid);
          await cardlist.save();
          // req.session.success="succefully up" 
          res.redirect("/user/cartlist");
      }else{
        res.status(404).send({"message":"Not found"});
      }

  }catch(err)
  {
    console.log(err);
  }
});
router.get("/order/:id",async(req,res)=>{
  try{
    const pid=req.params.id;
    const userData=req.session.userData;
      const product=await productModel.findById(pid);
      console.log(product);
      res.render("user/orderpage",{product,userData});     

  }catch(err)
  {
    console.log(err);
  }
});
//place an order
router.post("/order/:id",async(req,res)=>{
  try{
    console.log(req.body);
      const {userId,orderedProductId,userEmail,userMobile,quantity,deliveryAddress,totalPrice}=req.body;
      const newOrder=new orderModel({
        userId,
        orderedProductId,
        userEmail,
        userMobile,
        deliveryAddress,
        quantity,
        totalPrice    
      });
      const order=await newOrder.save();
      console.log("saved order"+order);
       //res.status(200).json("order place successfully"+order);
    res.redirect("/user/myOrderedList");
  }catch(err){
    console.log(err);
  }
});
router.get("/myOrderedList",async(req,res)=>{
  try{
    const userId=req.session.userData._id;
   const orders=await orderModel.find({userId:userId}).populate("orderedProductId");
   console.log(orders);
   const userData=req.session.userData;
    res.render("user/myOrderedlist",{orders,userData});
//res.send("user ordered page");
  }catch(err){
    console.log(err);
  }
});
router.delete("/order/delete/:id",async(req,res)=>{
  try{
    const oid=req.params.id;
    console.log("order id "+oid);
    const order=await orderModel.findByIdAndDelete(oid);
 if(!order)
 {
  res.status(404).send("order not found");
 }
 //order successfully deleted
 res.sendStatus(204);
  }catch(err)
  {
    console.log(err);
  }
});

router.get("/profile",(req,res)=>{
  const userData=req.session.userData;
  res.render("user/profile.ejs",{userData})
})


//giving riviews
router.post("/comment/:pid",async(req,res)=>{
  try {
console.log(req.body);
      const pid=req.params.pid;
      const user=req.session.userData;
    console.log("log user "+user);
      const newcomment=new commentModel({
        comment:req.body.comment,
        productId:pid,
        commentedBy:user._id
      });
      console.log(newcomment);
      await newcomment.save();
     return res.redirect(`/product/${pid}`);
  } catch (error) {
    console.log(error);
  }
})

module.exports=router;