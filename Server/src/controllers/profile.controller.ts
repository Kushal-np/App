import { RequestHandler } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUserProfile: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest; 
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error instanceof Error ? error.message : error });
  }
};
