const asyncHandler=require('express-async-handler')
const subscription=require('../models/subscription');
const User=require('../models/user');
const Video=require('../models/video');
const Like=require('../models/like')
const Comment=require('../models/comments')
const WatchLater=require("../models/watchLater");
const { where } = require('sequelize');


const subscribe=asyncHandler(async(req,res,next)=>{
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    let result={err:[],status:"Successfull"};

    let {subscribedToId}=req.body;
    let subscriberId=req.userId;
    if(subscriberId==subscribedToId){
        result.err.push("user can not subscribed to himself")
        result.status="failed"
        return res.status(400).json(result)
    }
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
    let checkSub=await subscription.findOne({
        where:{
            subscriberId:subscriberId,
            subscribedToId:subscribedToId
        }
    })
    if(checkSub){
         result.status="failed"
        return res.status(400).json({msg:"you have already subscribed to this channel",status:result.status});
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
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    let result={err:[],status:"Successfull"};

    let {removeSubscribtionFromId}=req.body;
    let currentUserId=req.userId;
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
            subscribedToId
        }
    }
    )
    return res.status(200).json({msg:"subscribtion removed successfully",status:result.status});
})

const addManageLike=asyncHandler(async(req,res,next)=>{
    
    // still need to check if user is authorized by tokens 
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    const result={err:[],status:"successfull"}
    //likeType->1 means up ->0 means down
    const{videoUrl,likeType}=req.body;
    let userId=req.userId;
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
    let checkLike=await Like.findOne({
        where:{
            videoId:vid.id,
            userId:userId,
            likeType:likeType
        }
    })
    if(checkLike){
        result.err.push("you have already added/removed liked this video");
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
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    const result={err:[],status:"successfull"}
    //likeType->1 means up ->0 means down
    const{videoUrl,likeType}=req.body;
    let userId=req.userId;
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
    let checkLike=await Like.findOne({
        where:{
            videoId:vid.id,
            userId:userId,
            likeType:likeType
        }
    })
    if(checkLike){
        result.err.push("you have already added/removed disliked this video");
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
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    let result={err:[],status:"successfull"}
    let userId=req.userId;
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
        console.log("in");
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
    console.log(subsId)
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
        VideosUrl.push(ur.url)
    })
    }
    console.log(VideosUrl)
    return res.status(200).json({"urls":VideosUrl});

})
const addComment=asyncHandler(async(req,res,next)=>{
    if(!req.isAuth){
        throw new Error("not authenticated")
    }
    let result={err:[],status:"successfull"}
    let {videoId,comment}=req.body;
   
    let userId=req.userId;
    let user=await User.findByPk(userId);
    let vid=await Video.findByPk(videoId);
    if(!user){
        result.err.push("no user found with this id");
        result.status="failed"
        return res.status(400).json(result)
    }
    if(!vid){
        result.err.push("no video found with this id");
        result.status='failed';
        return res.status(400).json(result)
    }
    let newComment=new Comment({
        videoId,
        userId,
        comments:comment
    })
   let savedComment= await newComment.save();
   if(!savedComment){
    result.err.push("error while saving the comment");
    result.status='failed';
    return res.status(500).json(result)
   }
   return res.status(200).json({msg:"comment uploaded successfully",comment:savedComment,status:result.status});

})
const getComment=asyncHandler(async(req,res,next)=>{
    if(!req.isAuth){
        throw new Error("not authenticated")
    }

    let result={err:[],status:"successfull"}
    let {videoId}=req.body;
    let userId=req.userId;

    let user=await User.findByPk(userId);
    if(!user){
        result.err.push("no user found with this id");
        result.status="failed"
        return res.status(400).json(result)
    }
    let comments=await Comment.findAll({
        where:{
            videoId:videoId
        }
    })
    if(!comments){
        return res.status(200).json({msg:"No comments on this video",status:result.status});
    }
    return res.status(200).json({Comments:comments,status:result.status})
})

const addWatchLater=asyncHandler(async(req,res,next)=>{
    if(!req.isAuth){
        throw new Error("not authenticated")
    }

    let result={err:[],status:"successfull"}
    let {videoId}=req.body;
    let userId=req.userId;
    let checkVid=await Video.findByPk(videoId);
    if(!checkVid){
        result.err.push("no video found");
        result.status="failed";
        return res.status(500).json(result);
    }
    let watchLater= new WatchLater({
        videoId,
        userId
    })
    await watchLater.save();
    return res.status(200).json({msg:"added to watch later",status:result.status});
})

module.exports={
    subscribe,
    cancelSub,
    addManageLike,
    removeManageLike,
    feed,
    addComment,
    getComment,
    addWatchLater
}