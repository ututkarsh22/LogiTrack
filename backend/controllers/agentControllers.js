import User from "../models/User.js";
import Order from "../models/Order.js";
import { getDistance } from "../utils/distance.js";
import { getCoordinates } from "../utils/getCoordinates.js";
import AgentModel from "../models/Agent.model.js";
import OrderHistory from "../models/OrderHistory.js";

export const agentLocation = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Provide Location details",
      });
    }

    let agentLocation;
    if (typeof location === 'string') {
      agentLocation = await getCoordinates(location);
    } else if (location && location.lat && location.lng) {
      agentLocation = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }


    const agent = await AgentModel.findOneAndUpdate(
      { user: req.user.id },
      { location: agentLocation },
      { new: true, upsert: true }
    );
    let assignedOrder = null;

    // Check if the agent is already assigned an order
    if (agent.orderId) {
      assignedOrder = await Order.findById(agent.orderId);
    }

    // Only look for new orders if agent is not currently assigned
    if (!assignedOrder && agent.isAvailable) {
      const pendingOrders = await Order.find({
        status: "pending",
      });

      for (const order of pendingOrders) {
        if (!order.pickupLocation || !order.pickupLocation.lat || !order.pickupLocation.lng) {
          continue;
        }

        const distance = getDistance(
          order.pickupLocation.lat,
          order.pickupLocation.lng,
          agentLocation.lat,
          agentLocation.lng
        );

        if (distance <= 10) {
          // Atomic assignment: only update if the order is still pending
          const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, status: "pending" },
            { agent: agent._id, status: "assigned" },
            { new: true }
          );

          // If another agent/request already grabbed this order, skip
          if (!updatedOrder) continue;

          agent.isAvailable = false;
          agent.orderId = order._id;
          await agent.save();

          assignedOrder = updatedOrder;
          break;
        }
      }
    }

    res.json({
      success: true,
      message: "Location Updated",
      agent,
      assignedOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const orderDetails = await Order.findById(id);

    if (!orderDetails) {
      return res.status(404).json({
        success: false,
        message: "No order Found",
      })
    }

    res.status(200).json({
      success : true,
      message : "Order fetch successful",
      orderDetails
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const verifyPickupOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    
    if (!orderId || !otp) {
      return res.status(400).json({ success: false, message: "Order ID and OTP are required" });
    }

    const order = await Order.findById(orderId).select('+pickupOtp');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "assigned") {
      return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
    }

    // Agent validation
    const agent = await AgentModel.findOne({ user: req.user.id });
    if (!agent || agent.orderId?.toString() !== orderId) {
      return res.status(403).json({ success: false, message: "You are not assigned to this order" });
    }

    if (order.pickupOtp?.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid Pickup OTP" });
    }

    // Update status to picked
    order.status = "picked";
    await order.save();

    // Note: The "picked" → "in-transit" transition is handled by a server-level
    // polling job (see server.js) instead of setTimeout, so it survives server restarts.

    res.json({
      success: true,
      message: "OTP Verified Successfully. Package Picked Up!",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    
    if (!orderId || !otp) {
      return res.status(400).json({ success: false, message: "Order ID and OTP are required" });
    }

    const order = await Order.findById(orderId).select('+deliverOtp');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ success: false, message: "Order is already delivered" });
    }

    if (order.status !== "picked" && order.status !== "in-transit") {
      return res.status(400).json({ success: false, message: `Cannot deliver order in status: ${order.status}` });
    }

    const agent = await AgentModel.findOne({ user: req.user.id });
    if (!agent || agent.orderId?.toString() !== orderId) {
      return res.status(403).json({ success: false, message: "You are not assigned to this order" });
    }

    if (order.deliverOtp?.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid Delivery OTP" });
    }

    // Move to history collection
    const historyOrder = new OrderHistory({
      customer: order.customer,
      agent: order.agent,
      pickupLocation: order.pickupLocation,
      pickupAddress: order.pickupAddress,
      dropLocation: order.dropLocation,
      dropAddress: order.dropAddress,
      packageDetails: order.packageDetails,
      fare: order.fare,
      originalCreatedAt: order.createdAt
    });
    await historyOrder.save();

    // Delete from active orders collection
    await Order.findByIdAndDelete(orderId);

    // Free the agent to take new orders
    agent.isAvailable = true;
    agent.orderId = null;
    await agent.save();

    res.json({
      success: true,
      message: "OTP Verified. Package Delivered Successfully!",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAgentStatus = async (req, res) => {
  try {
    const agent = await AgentModel.findOne({ user: req.user.id }).populate("orderId");
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }
    res.json({
      success: true,
      message: "Agent status fetched successfully",
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}