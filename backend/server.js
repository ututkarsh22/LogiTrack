import "./config/dotenv.js"
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import orderRoute from "./routes/orderRoute.js"
import agentRoute from "./routes/agentRoutes.js"
import connectDb from "./config/db.js"
import Order from "./models/Order.js"

const app = express();

// Configurable CORS origin (defaults to localhost for dev)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting on auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const port = process.env.PORT;

connectDb()
  .then(() => console.log('MongoDb connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/agent', agentRoute);

// Polling job: transition "picked" orders older than 5 minutes to "in-transit".
// This replaces the fragile setTimeout approach that was lost on server restart.
const TRANSIT_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 60 * 1000; // check every 60 seconds

setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - TRANSIT_DELAY_MS);
    const result = await Order.updateMany(
      { status: "picked", updatedAt: { $lte: cutoff } },
      { status: "in-transit" }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Transit Job] Transitioned ${result.modifiedCount} order(s) to in-transit`);
    }
  } catch (err) {
    console.error("[Transit Job] Error:", err.message);
  }
}, POLL_INTERVAL_MS);

app.listen(port, () => {
  console.log(`Server is running successfully on port ${port}`)
});