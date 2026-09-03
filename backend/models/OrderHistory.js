import mongoose from "mongoose";

const orderHistorySchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    },
    pickupLocation: {
        lat: Number,
        lng: Number
    },
    pickupAddress: String,
    dropLocation: {
        lat: Number,
        lng: Number
    },
    dropAddress: String,
    packageDetails: {
        type: String
    },
    status: {
        type: String,
        default: "delivered"
    },
    originalCreatedAt: {
        type: Date
    },
    fare: {
        type: Number,
        default: 0
    },
    deliveredAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("OrderHistory", orderHistorySchema);
