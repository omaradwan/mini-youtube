const asyncHandler=require('express-async-handler')
const subscription=require('../models/subscription');
const User=require('../models/user');
const {validationResult}=require('express-validator')

const subscribe=asyncHandler(async(req,res,next)=>{
    
    let result={err:[],status:"Successfull"};

    let {subscriberId,subscribedToId}=req.body;
    if(!subscriberId||!subscribedToId){
        result.err.push("there is missing id");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let user1=await User.findByPk(subscriberId);
    if(!user1){
        result.err.push("subscriberId is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let user2=await User.findByPk(subscribedToId);
    if(!user2){
        result.err.push("subscriberto Id is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let newSubscribtion=new subscription({
        subscriberId:subscriberId,
        subscribedToId:subscribedToId
    })
    await newSubscribtion.save();
    return res.status(200).json({msg:"subscribtion added successfully",status:"success"})
})

const cancelSub=asyncHandler(async(req,res,next)=>{
    let result={err:[],status:"Successfull"};

    let {currentUserId,removeSubscribtionFromId}=req.body;
    // currentUser hyshel el subscribe el3mlo l el user eltany elhwa removeSubscribtionId
    if(!currentUserId||!removeSubscribtionFromId){
        result.err.push("there is missing id");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let user1=await User.findByPk(currentUserId);
    if(!user1){
        result.err.push("subscriberId is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let user2=await User.findByPk(removeSubscribtionFromId);
    if(!user2){
        result.err.push("subscriberto Id is not correct");
        result.status="Failed";
        return res.status(400).json(result);
    }
    let cancelSubscribtion=await subscription.destroy({
        where:{
            subscriberId:currentUserId,
            subscribedToId:removeSubscribtionFromId
        }
    })
    if(!cancelSubscribtion){
        result.err.push("error removing subscribtion");
        result.status="Failed"
        return res.status(400).json(result)
    }
    return res.status(200).json({msg:"subscribtion removed successfully",status:result.status});
})


module.exports={
    subscribe,
    cancelSub
}