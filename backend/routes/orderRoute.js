import express from "express";
import { verifyAdmin, verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { createOrder, getOrders , viewOrder, getHistory, calculateFare } from "../controllers/orderController.js";

const router = express.Router();

router.get("/all-orders",verifyToken, requireRole('customer'), getOrders);
router.post("/take-order",verifyToken, requireRole('customer'), createOrder);
router.get("/view-order/:id",verifyToken, requireRole('customer'), viewOrder);
router.get("/history", verifyToken, requireRole('customer'), getHistory);
router.post("/calculate-fare", verifyToken, requireRole('customer'), calculateFare);

export default router;