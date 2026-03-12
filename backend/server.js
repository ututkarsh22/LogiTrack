import "./config/dotenv.js"
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import orderRoute from "./routes/orderRoute.js"
import agentRoute from "./routes/agentRoutes.js"
import connectDb from "./config/db.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

const port = process.env.PORT;

connectDb()
.then(() => console.log('MongoDb connected'))
.catch((err) => console.log(err));

app.use('/api/auth' , authRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/agent', agentRoute);

app.listen(port,() => {
    console.log(`Sever is running successfully on port ${port}`)
});