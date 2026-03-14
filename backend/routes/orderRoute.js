import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { createOrder, getOrders , viewOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/all-orders",verifyToken,getOrders);
router.post("/take-order",verifyToken,createOrder);
router.get("/view-order/:id",verifyToken,viewOrder);

export default router;