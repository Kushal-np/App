import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/user.route"
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT 

app.use(express.json());
app.use(cookieParser())

app.use("/auth" , authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
