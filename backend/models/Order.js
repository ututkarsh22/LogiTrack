import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    agent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    pickupLocation:{
        lat:Number,
        lng:Number
    },

    dropLocation:{
        lat:Number,
        lng:Number
    },

    packageDetails : {
        type : String
    },
    status:{
        type:String,
        enum:["pending","assigned","picked","delivered"],
        default:"pending"
    },
    pickupOtp : {
            type : String,
            select : false,
        },
    deliverOtp: {
            type : String,
            select : false
        }

},{timestamps:true});

export default mongoose.model("Order",orderSchema);