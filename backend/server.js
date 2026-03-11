import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import dotenv from 'dotenv';
import mongoose  from 'mongoose';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDb connected'))
.catch((err) => console.log(err));

app.use('/api/auth' , authRoutes);
app.get('/' , (req , res) => {
    res.send("API is running");
})
app.listen(process.env.PORT);