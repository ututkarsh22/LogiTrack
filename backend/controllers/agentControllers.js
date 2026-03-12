import User from "../models/User.js";
import Order from "../models/Order.js";
import { getDistance } from "../utils/distance.js";

export const agentLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(401).json({
        sucess: false,
        message: "Provide Location details",
      });
    }

    const agent = await User.findByIdAndUpdate(
      req.user.id,
      { location: { lat, lng } },
      { new: true },
    );

    const pendingOrders = await Order.find({
      status: "pending",
    });

    let assignedOrder = null;

    for (const order of pendingOrders) {
      const distance = getDistance(
        order.pickupLocation.lat,
        order.pickupLocation.lng,
        lat,
        lng,
      );

      if (distance <= 15) {
       

        order.agent = agent._id;
        order.status = "assigned";

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
