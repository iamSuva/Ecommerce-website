const userModel=require("../models/userModel");
const bcryptjs=require("bcryptjs");
const createHashpassword=async (password)=>{
   try{
         const hpass=await bcryptjs.hash(password,10);
         return hpass;
   }catch(err)
   {
       res.status(400).send(err.message);
   }

}
const registerUser=async(req,res)=>{
    try{
     
        //hashed password
        const hashpassword=await createHashpassword(req.body.password);


       const user=new userModel({
        username:req.body.username,
        email:req.body.email,
        password:hashpassword,
        usertype:req.body.usertype
       });
   //check whether email exist
   const userData=await userModel.findOne({email:req.body.email});
     if(userData)
     {res.status(200).send({success:false,msg:"email already exist"})

     }else{
        const  usersave=await user.save();
        res.status(200).send({success:true,data:usersave});
     }
    }catch(error)
    {
        res.status(400).send(error.message);
    }
}

module.exports={
    registerUser
}