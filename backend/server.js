import dotenv from "./config/dotenv.js"
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import connectDb from "./config/db.js"
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

const port = process.env.PORT;

connectDb()
.then(() => console.log('MongoDb connected'))
.catch((err) => console.log(err));

app.use('/api/auth' , authRoutes);
app.get('/' , (req , res) => {
    res.send("API is running");
})
app.listen(port,() => {
    console.log(`Sever is running successfully on port ${port}`)
});