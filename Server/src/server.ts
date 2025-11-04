import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
dotenv.config();

const app = express();
const PORT = process.env.PORT 

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
