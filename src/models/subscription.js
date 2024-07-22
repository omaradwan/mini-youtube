const { subscribe } = require("diagnostics_channel")
const {primarydb}=require("../config/database")
const {DataTypes}=require("sequelize")
const user = require("./user")

const subscription=primarydb.define('Subscription',{
    subscriberId:{
        type:DataTypes.INTEGER,
        references:{
            model:user,
            key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    subscribedToId:{
        type:DataTypes.INTEGER,
        references:{
            model:user,
            key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:"CASCADE"
    }
})

module.exports=subscription;