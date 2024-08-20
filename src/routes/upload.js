const express=require('express')
const route=express.Router();
const uploadController=require('../controllers/uploadController')
const {verifyToken}=require('../middleware/TokensManagment');


route.post('/upload',verifyToken,uploadController.upload)
route.get('/get',verifyToken,uploadController.watch)
module.exports=route



