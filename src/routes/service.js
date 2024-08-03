const express=require('express')
const route=express.Router();
const serviceController=require('../controllers/serviceController');


route.post('/subscribe',serviceController.subscribe);
route.post('/remove_subscribtion',serviceController.cancelSub)
route.post('/manage_like',serviceController.addManageLike);
route.post('/manage_dislike',serviceController.removeManageLike)

module.exports=route