import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true,
        minimum : 6
    },

    role:{
        type:String,
        enum:["customer","agent","admin"],
        default:"customer"
    }

},{timestamps:true});

export default mongoose.model("User",userSchema);