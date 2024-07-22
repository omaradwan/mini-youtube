const {primarydb}=require("../config/database")
const {DataTypes}=require("sequelize")
const video = require("./video")
const user = require("./user")

const watchlater=primarydb.define("WatchLater",{
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
    }
})
module.exports=watchlater;