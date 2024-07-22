const express=require('express')
const route=express.Router();
const serviceController=require('../controllers/serviceController');


route.post('/subscribe',serviceController.subscribe);
route.post('/remove_subscribtion',serviceController.cancelSub)

module.exports=route