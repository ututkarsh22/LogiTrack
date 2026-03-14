import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    isAvailable : {
        type : Boolean,
        default : true,
    },
    location : {
        lat : Number,
        lng : Number
    },
    orderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        default : null
    }
},{timestamps : true})

export default mongoose.model("Agent",agentSchema);