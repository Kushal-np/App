import express from "express" ; 

import Router from "express";
import { getMe, logout, signin, signup } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const app = Router();

app.post("/signup" , signup) ; 
app.post("/login" , signin) ;
app.post("/logout" , logout);

app.get("/me" , authenticate , getMe)

export default app ; 