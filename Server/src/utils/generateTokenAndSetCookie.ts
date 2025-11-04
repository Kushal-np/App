import jwt from "jsonwebtoken";
import { Response } from "express";

interface TokenPayload {
  userId: string;
  role: "admin" | "instructor" | "student";
}

export const generateTokenAndSetCookie = (
  userId: string,
  role: TokenPayload["role"],
  res: Response
) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "15d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 60 * 60 * 1000, 
  });

  return token; 
};
