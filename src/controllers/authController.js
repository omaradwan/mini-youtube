const asyncHandler=require('express-async-handler')
const bcrypt=require('bcrypt');
const User=require('../models/user');
const {validationResult}=require('express-validator')


const login=asyncHandler(async(req,res,next)=>{
    let errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    let result={err:[],status:"successfull"}
    const {email,password}=req.body;
    if(!email||!password){
        result.err.push("all fields are required");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let user=await User.findOne({
        where:{
            email:email
        }
     });
    console.log(user)
    if(!user){
        result.err.push("email is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let isValid=await bcrypt.compare(password,user.password);
    if(!isValid){
        result.err.push("password is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    //////////////////////////
    // generate Token
    //////////////////////////
   
    return res.status(200).json({msg:"logged in successfilly",status:result.status,userData:user})
})

const signup=asyncHandler(async(req,res,next)=>{

    let errors=validationResult(req)
    //console.log(errors)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    let result={err:[],status:"successfull"}

    const {username,email,password}=req.body;
   

    if(!username||!email||!password){
        result.err.push("all fields are required");
        result.status="Failed";
        return res.status(400).json(result);
    }

    //////////////////////////
    // generate Token
    //////////////////////////
    let encryptedPass=await bcrypt.hash(password,14);
    let newUser=new User({
        username,
        email,
        password:encryptedPass
    })
    await newUser.save();
    return res.status(200).json({msg:"User created successfully",status:result.status,userData:newUser})
})


module.exports={
    login,
    signup
}