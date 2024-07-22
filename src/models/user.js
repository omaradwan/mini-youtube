
const { emit } = require("process");
const {primarydb}=require("../config/database");
const {DataTypes}=require("sequelize");

const User=primarydb.define('User',{
     username:{
        type:DataTypes.STRING,
      //  allowNull:false
     },
     email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:{
          msg: 'Email address already in use!'
        }
      //   validate:{
      //       isEmail:{
      //           msg:"must be a valid email"
      //       }
      //   }
     },
     password:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            len:{
                args:[4],
                msg:"password must be at least 4 char long"
            }
        }
     },
     noOfVideos:{
        type:DataTypes.INTEGER,
        defaultValue:0
     },
     noOfSubscribers:{
        type:DataTypes.INTEGER,
        defaultValue:0
     }

},{
   indexes:[
    {
        unique:true,
        fields:['email']// index on email
    }
   ]
})
module.exports=User;