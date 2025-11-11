import express , {Request , RequestHandler, Response , Router} from "express";
import { authenticate  } from "../middleware/auth.middleware";
import { getUserProfile } from "../controllers/profile.controller";
const router = Router();


router.get("/user/:id" ,authenticate as unknown as RequestHandler ,getUserProfile as unknown as RequestHandler);


export default router ; 