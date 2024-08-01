const express=require('express')
const route=express.Router();
const uploadController=require('../controllers/uploadController')



route.post('/upload',uploadController.upload)
route.get('/get',uploadController.watch)
module.exports=route



