const asyncHandler=require('express-async-handler')
const subscription=require('../models/subscription');
const User=require('../models/user');
const Video=require('../models/video');
const Like=require('../models/like')
const { where } = require('sequelize');


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

    // increment the count of subscriberToId
    await User.increment("noOfSubscribers",{
        where:{
            id:subscribedToId
        }
    }
    )
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
    await User.decrement("noOfSubscribers",{
        where:{
            id:subscribedToId
        }
    }
    )
    return res.status(200).json({msg:"subscribtion removed successfully",status:result.status});
})

const addManageLike=asyncHandler(async(req,res,next)=>{
    
    // still need to check if user is authorized by tokens 
    
    const result={err:[],status:"successfull"}
    //likeType->1 means up ->0 means down
    const{userId,videoUrl,likeType}=req.body;
    
    const vid=await Video.findOne({
        where:{
            url:videoUrl
        }
    })
    if(!vid){
        result.err.push("video has been deleted or invalid url");
        result.status="failed";
        return res.status(400).json(result);
    }
    if(likeType==1){
         vid.likeCounts=vid.likeCounts+1;
         const newLike=new Like({
            videoId:vid.id,
            userId:userId,
            likeType:likeType
        })
        await newLike.save();
    }
    else{
        vid.likeCounts=vid.likeCounts-1
        await Like.destroy({
            where:{
                videoId:vid.id,
                userId:userId,
            }
        })
    }

    await vid.save();
    return res.status(200).json({msg:"like added/removed successfully",status:result.status});
})

const removeManageLike=asyncHandler(async(req,res,next)=>{
    // still need to check if user is authorized by tokens 

    const result={err:[],status:"successfull"}
    //likeType->1 means up ->0 means down
    const{userId,videoUrl,likeType}=req.body;

    const vid=await Video.findOne({
        where:{
            url:videoUrl
        }
    })
    if(!vid){
        result.err.push("video has been deleted or invalid url");
        result.status="failed";
        return res.status(400).json(result);
    }
    if(likeType==1){
         vid.dislikeCounts=vid.dislikeCounts+1;
         const newLike=new Like({
            videoId:vid.id,
            userId:userId,
            likeType:likeType-1 // will be saved in db as 0 so if liketype was 1 then userid do like to the video and if 0 then user dislike the video
        })
        await newLike.save();
    }
    else{
        vid.dislikeCounts=vid.dislikeCounts-1;
        await Like.destroy({
            where:{
                videoId:vid.id,
                userId:userId,
            }
        })
    }
    
    await vid.save();
    return res.status(200).json({msg:"dislike added/removed successfully",status:result.status});
})

const feed=asyncHandler(async(req,res,next)=>{
    let result={err:[],status:"successfull"}
    let {userId}=req.body;
    // will check it by token later
    let user=await User.findByPk(userId);
    
    if(!user){
        result.err.push("no user found with this id");
        result.status="failed";
        return res.status(400).json(result);
    }
    let subsId=await subscription.findAll({
        where:{
           subscriberId:userId
        }
    })
  //  console.log(subsId);
    if(!subsId){
        let videos=await Video.findAll({
            attributes:['url'],
            limit:6
        })
    //    console.log("videos ",videos);
        urls=videos.map(v=>v.dataValues.url);
        return res.status(200).json(...urls);
    }
    // if there is subsId then i will divide it by 6 to return the same no of videos from each subscriber
    subsId=subsId.map(id=>id.subscribedToId);
   // console.log(subsId)
    let numUrlsPerSubscriber=Math.ceil(subsId.length/6);
    let VideosUrl=[]

    for(var id of subsId){
        let retUrl=await Video.findAll({
            where:{
                userId:id
            },
            attributes:['url'],
            limit:numUrlsPerSubscriber
        })
      //  console.log(retUrl)
        retUrl.map(ur=>{
         //   console.log(ur.url)
            VideosUrl.push(ur.url)
    })
    }
    console.log(VideosUrl)
    return res.status(200).json({"urls":VideosUrl});

})


module.exports={
    subscribe,
    cancelSub,
    addManageLike,
    removeManageLike,
    feed
}