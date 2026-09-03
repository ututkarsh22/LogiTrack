import mongoose from "mongoose";
import Order from "./models/Order.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const orders = await Order.find({ status: "pending" });
    let output = `Found ${orders.length} pending orders\n`;
    for (const o of orders) {
        output += `Order ${o._id}: Pickup=${JSON.stringify(o.pickupLocation)} Drop=${JSON.stringify(o.dropLocation)}\n`;
    }
    fs.writeFileSync("db_output.txt", output);
    process.exit(0);
};

run();
