const {primarydb}=require("../config/database")
const {DataTypes}=require("sequelize")
const video = require("./video")
const user = require("./user")

const comment=primarydb.define('Comment',{
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
    comments:{
        type:DataTypes.STRING
    },
    createdAt:{
        type:DataTypes.DATE
    }
})
module.exports=comment;