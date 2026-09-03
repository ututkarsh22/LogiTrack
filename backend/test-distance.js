import mongoose from "mongoose";
import Order from "./models/Order.js";
import Agent from "./models/Agent.model.js";
import { getDistance } from "./utils/distance.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const orders = await Order.find({ status: "pending" });
    const agents = await Agent.find({});
    
    let out = `Found ${orders.length} pending orders\nFound ${agents.length} agents\n`;

    for (const agent of agents) {
        out += `\nAgent ${agent._id} | Location: ${JSON.stringify(agent.location)} | Available: ${agent.isAvailable}\n`;
        for (const order of orders) {
            if (!agent.location || !agent.location.lat) {
                out += `  Agent has no location\n`;
                continue;
            }
            if (!order.pickupLocation || !order.pickupLocation.lat) {
                out += `  Order ${order._id} has no location\n`;
                continue;
            }
            const dist = getDistance(
                order.pickupLocation.lat, order.pickupLocation.lng,
                agent.location.lat, agent.location.lng
            );
            out += `  Distance to Order ${order._id}: ${dist.toFixed(2)} km\n`;
        }
    }
    fs.writeFileSync("distance_out.txt", out);
    process.exit(0);
};

run();
