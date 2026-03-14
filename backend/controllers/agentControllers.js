import User from "../models/User.js";
import Order from "../models/Order.js";
import { getDistance } from "../utils/distance.js";
import { getCoordinates } from "../utils/getCordinates.js";
import AgentModel from "../models/Agent.model.js";

export const agentLocation = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(401).json({
        sucess: false,
        message: "Provide Location details",
      });
    }

    const agentLocation = await getCoordinates(location);


    const agent = await AgentModel.findOneAndUpdate(
      { user: req.user.id },
      { location: agentLocation },
      { new: true },
    );

    console.log("agent hu", agent)
    const pendingOrders = await Order.find({
      status: "pending",
    });

    let assignedOrder = null;

    for (const order of pendingOrders) {
      const distance = getDistance(
        order.pickupLocation.lat,
        order.pickupLocation.lng,
        agentLocation.lat,
        agentLocation.lng
      );

      if (distance <= 20 && agent.isAvailable === true) {


        order.agent = agent._id;
        order.status = "assigned";
        agent.isAvailable = false,
          agent.orderId = order._id

        await agent.save();
        await order.save();

        assignedOrder = order;

        break;
      }
    }

    res.json({
      success: true,
      message: "Location Updated",
      agent,
      assignedOrder,
    });
  } catch (error) {
    res.status(501).json({
      message: error.message,
    });
  }
};


export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("id", id);
    const orderDetails = await Order.findById(id);

    if (!orderDetails) {
      return res.status(401).json({
        success: false,
        message: "No order Found",
      })
    }

    res.status(201).json({
      success : true,
      message : "Order fetch successful",
      orderDetails
    })

  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  }
}