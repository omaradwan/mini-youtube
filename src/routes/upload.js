const express=require('express')
const route=express.Router();
const uploadController=require('../controllers/uploadController')



route.post('/upload',uploadController.upload)

module.exports=route



