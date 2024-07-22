const express=require('express')
const route=express.Router();
const authController=require('../controllers/authController')
const {check,validationResult}=require('express-validator')

route.post('/login',
    [check('email').isEmail().withMessage('invalid email format'),
     check('password').trim().notEmpty().withMessage('password is required'),
    ],
    authController.login);

route.post('/signup',
    [check('username').notEmpty().withMessage('username is required'),
     check('email').isEmail().withMessage('invalid email format'),
     check('password').trim().notEmpty().withMessage('password is required')],
    authController.signup)
// route.post('/resetpassword',)


module.exports=route;