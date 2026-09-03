import mongoose from "mongoose";
import Agent from "./models/Agent.model.js";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const agents = await Agent.find({});
    for (const a of agents) {
        console.log(`Agent ${a._id}: isAvailable=${a.isAvailable}, orderId=${a.orderId}`);
    }
    process.exit(0);
};
run();
