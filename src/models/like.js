const {primarydb}=require("../config/database")
const {DataTypes}=require("sequelize")
const video = require("./video")
const user = require("./user")

const like=primarydb.define('Like',{
    videoId:{
        type:DataTypes.INTEGER,
        references:{
            model:video,
            key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    userId:{
        type:DataTypes.INTEGER,
        references:{
            model:user,
            key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    likeType:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }
})
module.exports=like;