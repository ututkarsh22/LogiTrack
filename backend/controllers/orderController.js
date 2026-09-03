import Orders from "../models/Order.js";
import { getDistance } from "../utils/distance.js";
import User from "../models/User.js"
import { getCoordinates } from "../utils/getCoordinates.js";
import AgentModel from "../models/Agent.model.js";
import OrderHistory from "../models/OrderHistory.js";

export const getOrders = async (req, res) => {
  try {
    const order = await Orders.find({ customer: req.user.id }).select('+pickupOtp +deliverOtp').populate('agent');

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "No Order Available",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetched all Orders of this customer",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, packageDetails } = req.body;
    
    if (!pickupLocation || !dropLocation || !packageDetails) {
      return res.status(400).json({
        success: false,
        message: "Fill all Details",
      });
    }

    const pickup = await getCoordinates(pickupLocation);
    const drop = await getCoordinates(dropLocation);

    // Calculate fare: ₹10 per km, rounded to nearest rupee
    const distanceKm = getDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    const fare = Math.round(distanceKm * 10);

    const otpPick = Math.floor(1000 + Math.random() * 9000);
    const otpDrop = Math.floor(1000 + Math.random() * 9000);

    // Create order first as pending
    const order = await Orders.create({
       customer: req.user.id,
       agent: null,
       pickupLocation : pickup,
       pickupAddress: pickupLocation,
       dropLocation : drop,
       dropAddress: dropLocation,
       packageDetails,
       pickupOtp : otpPick,
       deliverOtp : otpDrop,
       fare,
       status: "pending",
    });

    // Attempt atomic agent assignment
    const agents = await AgentModel.find({
      isAvailable: true,
    }).populate("user");

    let assignedAgent = null;
    let minDistance = Infinity;

    for (let agent of agents) {
      if (!agent.location || !agent.location.lat || !agent.location.lng) continue;

      const distance = getDistance(
        pickup.lat,
        pickup.lng,
        agent.location.lat,
        agent.location.lng
      );
      
      if (distance < minDistance && distance <= 10) { // Keep search within 10km radius
        minDistance = distance;
        assignedAgent = agent;
      }
    }

    if (assignedAgent) {
      // Atomic: only assign if order is still pending (prevents race with agentLocation)
      const updatedOrder = await Orders.findOneAndUpdate(
        { _id: order._id, status: "pending" },
        { agent: assignedAgent._id, status: "assigned" },
        { new: true }
      );

      if (updatedOrder) {
        assignedAgent.isAvailable = false;
        assignedAgent.orderId = order._id;
        await assignedAgent.save();
      }
    }

    // Fetch the final order state to return
    const finalOrder = await Orders.findById(order._id);

    res.status(200).json({
      success: true,
      message: "Order created Successfully",
      order: finalOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error from ordercontroller ${error.message}`,
    });
  }
};

export const viewOrder = async(req,res) =>{
  try {
    const {id} = req.params;
    const details = await Orders.findById(id).select("+pickupOtp +deliverOtp");

    if(!details){
     return  res.status(404).json({
        message : "order does not exist",
        success : false
      })
    }
    res.status(200).json({
      success : true,
      message : "Order ID fetched",
      details
    })
  } catch (error) {
    res.status(500).json({
      message : error.message,
      success : false
    })
  }
}

export const getHistory = async (req, res) => {
  try {
    const history = await OrderHistory.find({ customer: req.user.id }).populate('agent');

    res.status(200).json({
      success: true,
      message: "Fetched all order history of this customer",
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const calculateFare = async (req, res) => {
  try {
    const { pickupLocation, dropLocation } = req.body;

    if (!pickupLocation || !dropLocation) {
      return res.status(400).json({
        success: false,
        message: "Please provide both pickup and drop locations",
      });
    }

    const pickup = await getCoordinates(pickupLocation);
    const drop = await getCoordinates(dropLocation);

    const distanceKm = getDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    const ratePerKm = 10; // ₹10 per km
    const fare = Math.round(distanceKm * ratePerKm);

    res.status(200).json({
      success: true,
      message: "Fare calculated successfully",
      distanceKm: Math.round(distanceKm * 100) / 100, // round to 2 decimals
      fare,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};