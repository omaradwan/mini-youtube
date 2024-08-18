const express=require('express')
const route=express.Router();
const serviceController=require('../controllers/serviceController');
const {verifyToken}=require('../middleware/TokensManagment');


route.post('/subscribe',verifyToken,serviceController.subscribe);
route.post('/remove_subscribtion',verifyToken,serviceController.cancelSub)
route.post('/manage_like',verifyToken,serviceController.addManageLike);
route.post('/manage_dislike',verifyToken,serviceController.removeManageLike)
route.get('/feed',verifyToken,serviceController.feed)
route.post('/addComment',verifyToken,serviceController.addComment)
route.get('/getComment',verifyToken,serviceController.getComment)
route.post('/watchLater',verifyToken,serviceController.addWatchLater);

module.exports=route
