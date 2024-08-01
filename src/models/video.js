const {primarydb}=require("../config/database")
const {DataTypes}=require("sequelize")
const user = require("./user")


const video=primarydb.define('Video',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Auto-increment for primary key
        primaryKey: true,    // Mark this column as the primary key
      },
    url:{
       type:DataTypes.STRING,
       unique:true,
       allowNull:false
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false,
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
    likeCounts:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    commentCounts:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    describtion:{
        type:DataTypes.STRING,
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:false
    }
})
module.exports=video;