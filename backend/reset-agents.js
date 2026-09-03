import mongoose from "mongoose";
import Agent from "./models/Agent.model.js";
import Order from "./models/Order.js";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const agents = await Agent.find({});
        for (const a of agents) {
            console.log(`Resetting Agent ${a._id}...`);
            a.isAvailable = true;
            a.orderId = null;
            await a.save();
        }
        console.log("Agents reset successfully.");
        
        const orders = await Order.find({ status: "pending" });
        console.log(`There are ${orders.length} pending orders available.`);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
};
run();
