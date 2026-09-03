import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    agent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agent"
    },

    pickupLocation:{
        lat:Number,
        lng:Number
    },
    pickupAddress: String,

    dropLocation:{
        lat:Number,
        lng:Number
    },
    dropAddress: String,

    packageDetails : {
        type : String
    },
    status:{
        type:String,
        enum:["pending","assigned","picked","in-transit","delivered"],
        default:"pending"
    },
    pickupOtp : {
            type : String,
            select : false,
        },
    deliverOtp: {
            type : String,
            select : false
        },
    fare: {
        type: Number,
        default: 0
    }

},{timestamps:true});

export default mongoose.model("Order",orderSchema);