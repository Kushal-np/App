import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/user.route"
import cookieParser from "cookie-parser";
import cors from "cors"
dotenv.config();

const app = express();
const PORT = process.env.PORT 

app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", // allow frontend URL
  credentials: true,               // allow cookies to be sent
}));
app.use("/auth" , authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
