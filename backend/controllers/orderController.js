import Orders from "../models/Order.js";
import { getDistance } from "../utils/distance.js";
import User from "../models/User.js"
import { getCoordinates } from "../utils/getCordinates.js";
import AgentModel from "../models/Agent.model.js";
export const getOrders = async (req, res) => {
  try {
    const order = await Orders.find({ customer: req.user.id });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "No Order Available",
      });
    }

    res.status(201).json({
      success: true,
      message: "Fetched all Orders",
      order,
    });
  } catch (error) {
    return res.status(501).json({
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

    const agents = await AgentModel.find({
      isAvailable: true,
    }).populate("user");
     
   
    let assignedAgent = null;

    for (let agent of agents) {
      
     
      const distance = getDistance(
        pickup.lat,
        pickup.lng,
        agent.location.lat,
        agent.location.lng,

      );
      console.log("distance", distance)
      if (distance <= 20) {
        assignedAgent = agent;
        assignedAgent.isAvailable = false;
        break;
      }
    }

   const order = await Orders.create({
       customer: req.user.id,
       agent: assignedAgent,
       pickupLocation : pickup,
       dropLocation : drop,
       packageDetails,
       status: assignedAgent ? "assigned" : "pending",
    });
    
     if(assignedAgent !== null){

         assignedAgent.orderId = order._id
         assignedAgent.save();
     }
    
    res.status(200).json({
      success: true,
      message: "Order created Successfully",
      order,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: `Error from ordercontroller ${error.message}`,
    });
  }
};
