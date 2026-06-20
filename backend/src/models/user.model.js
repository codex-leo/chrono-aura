const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role :{
        type : String,
        enum : ["user","admin"],
        default : "user"
    },
    cart : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "cart",
    }
});

const UserModel = mongoose.model("user",userSchema);

module.exports = UserModel;