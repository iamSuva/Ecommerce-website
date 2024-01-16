const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
require("dotenv").config();
const PORT = process.env.PORT;
//connect to mongodb


// mongoose.connect("mongodb+srv://suvadip:suvadip@cluster0.yvk3opy.mongodb.net/test").then((response)=>{
//      console.log("connected");
// }).catch((err)=>{
//      console.log(err);
// })
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
     .then((response) => {
          console.log("connected to ecommerce")
     })
     .catch((err) => {
          console.log(err);
     })
const categoryModel = require("./models/categoryModel");
const productModel = require("./models/productModel");
const UserModel = require("./models/userModel");
const adminRoutes = require("./routing/adminroute/adminRoutes");
const productRoutes = require("./routing/productRoute/productRoutes");
const categoryRoutes = require("./routing/adminroute/categoryRoutes");
const userRoutes = require("./routing/userroute/userRoutes")
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
//setting up view engine
app.set("view engine", "ejs");
//creating a session
app.use(cookieParser());
app.use(session({
     saveUninitialized: true,
     resave: false,
     secret: "er38n3iuinv39j",
     cookie: { maxAge: 10 * 60 * 1000 } //10min in miliseconds
}))
//

function auth(req, res, next) {
     console.log("sess in auth: ", req.session.userData);
     if (req.session.userData) {
          next();
     }
     else {
          console.log("redirect");
          res.redirect("/");
     }
}
function userauth(req, res, next) {
     if (req.session.userData) {
          next();
     }
     else {
          res.redirect("/login");
     }
}
//google authentication
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
require("./passport");

//route
app.get("/auth/google",
     passport.authenticate("google", { scope: ['profile', 'email'] }))
app.get("/auth/google/callback",
     passport.authenticate("google",
          {
               successRedirect: "/auth/success",
               failureRedirect: "/auth/failure"
          }),

);
app.get("/auth/success", async (req, res) => {
     console.log(req.user);
     try {


          if (req.user) {
               // res.send("welcome "+req.user.displayName);
              
                  //  console.log(req.user.photos[0].value);
                  
                    //save the google user to database;
                  //  console.log("search emails"+req.user.emails[0].value);
                    const user=await UserModel.findOne({"email":req.user.emails[0].value});
                    console.log("google user ",user);
                    if(!user){
                         
                         const newuser = new UserModel({
                              username: req.user.displayName,
                              email: req.user.emails[0].value,
                              role:"user"
                         });
                       const userdata=  await newuser.save();
                       const userdetails={
                         _id:userdata._id,
                         username:req.user.displayName,
                         email:req.user.emails[0].value,
                         profilepic:req.user.photos[0].value
                        }
                    }
                    else{
                         req.session.userData=user;
                    }
                    
                  
                    res.redirect("/user");
          }
     } catch (error) {
          console.log(error);
     }
})
app.get("/auth/failure", (req, res) => {
     console.log(req.user);
     res.send("error");
})



//end of goole authentication
const userModel = require("./models/userModel");
const { log } = require("console");
app.get("/logout", (req, res) => {
     req.session.destroy();
     res.redirect("/")
});


app.get("/", async (req, res) => {
     try {
          const userData = req.session.userData;
          // console.log("session data in dashborad: ",userData);
          const categories = await categoryModel.find({});
          const products = await productModel.find({});//all products
          // console.log(products);
          res.render("home", { products, categories: categories, userData });
     } catch (err) {
          console.log(err);
     }

})

app.get("/login", (req, res) => {


     res.render("login");

});
app.get("/signup", (req, res) => {

     res.render("signup");
});

app.post("/signup", (req, res) => {
     console.log(req.body);
     if (req.body.username && req.body.email && req.body.password) {
          const newuser = new UserModel(req.body);
          newuser.save().then((response) => {
               console.log("user added");
          }).catch((err) => {
               console.log("some error occured");
          })
          res.redirect("/login");
     }
     else {
          console.log("some fields are empty");
          res.send("some fields are empty");
     }


});
//login post
app.post("/login", async (req, res) => {
     console.log(req.body);
     const { email, password } = req.body;
     try {
          const user = await UserModel.findOne({ email });
         // console.log("user found " + user);
          if (user) {
               if (user.password == password) {
                    // req.session.username=user.username;
                    //store full user details in req.session
                    req.session.userData = user;
                    console.log("session data:=>" + req.session.userData);

                    //check whether the login user is user and admin
                    if (req.body.role == "admin" && user.role == "admin") {
                         res.redirect("/admin");
                    }
                    else if (req.body.role == "user" && user.role == "user") {
                         // res.redirect("/");
                         // res.send("user dashboard");
                         res.redirect("/user")
                    }
                    else {
                         //res.send("login user not found");
                         //role mismatch
                         res.redirect("/login");
                    }

               }
               else {
                    console.log("password not match");
                    res.redirect("/login");
               }
          }
          else {
               res.status(401).send("user not found");
               //  res.redirect("/signup");
          }
     } catch (err) {
          console.log(err);
     }

})
// app.get("/users", async (req, res) => {
//      const allusers = await UserModel.find({});
//      console.log(allusers);
//      res.json(allusers);
// });

app.use("/", productRoutes);

app.use("/admin", auth, adminRoutes);
app.use("/user", userauth, userRoutes);

app.use("/admin", auth, categoryRoutes);
app.listen(PORT, (err) => {
     console.log("running on port " + PORT);
})