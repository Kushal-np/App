// ============================================
// 📁 src/types/user.ts
// ============================================
import { Document, Types } from "mongoose";

export interface IUserPreferences {
  nsfw: boolean;
  darkMode: boolean;
  emailNotifications: boolean;
  showAdultContent: boolean;
  language: string;
}

export interface IOAuthProviders {
  google?: {
    id: string;
    email: string;
  };
  github?: {
    id: string;
    email: string;
  };
}

export interface IKarma {
  post: number;
  comment: number;
  total: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  karma: IKarma;
  followersCount: number;
  followingCount: number;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  joinedSubreddits: Types.ObjectId[];
  moderatedSubreddits: Types.ObjectId[];
  savedPosts: Types.ObjectId[];
  upvotedPosts: Types.ObjectId[];
  downvotedPosts: Types.ObjectId[];
  upvotedComments: Types.ObjectId[];
  downvotedComments: Types.ObjectId[];
  preferences: IUserPreferences;
  refreshTokens: string[];
  oauthProviders: IOAuthProviders;
  isBanned: boolean;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  karma: IKarma;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  createdAt: Date;
}

// ============================================
// 📁 src/types/index.ts
// ============================================
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export * from "./user.js";

export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================
// 📁 src/models/User.ts (FIXED)
// ============================================
import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types/user.js";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: function(this: IUser) {
        return !this.oauthProviders?.google && !this.oauthProviders?.github;
      },
      select: false,
    },
    displayName: {
      type: String,
      default: "",
      maxlength: [50, "Display name must not exceed 50 characters"],
    },
    bio: {
      type: String,
      maxlength: [400, "Bio must not exceed 400 characters"],
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "https://default-avatar-url.png",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    karma: {
      post: { type: Number, default: 0 },
      comment: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    joinedSubreddits: [{ type: Schema.Types.ObjectId, ref: "Subreddit" }],
    moderatedSubreddits: [{ type: Schema.Types.ObjectId, ref: "Subreddit" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    upvotedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    downvotedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    upvotedComments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    downvotedComments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    preferences: {
      nsfw: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      showAdultContent: { type: Boolean, default: false },
      language: { type: String, default: "en" },
    },
    refreshTokens: [{ type: String }],
    oauthProviders: {
      google: {
        id: String,
        email: String,
      },
      github: {
        id: String,
        email: String,
      },
    },
    isBanned: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for username and email uniqueness
userSchema.index({ username: 1, email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "karma.total": -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update karma total (computed field)
userSchema.pre("save", function (next) {
  if (this.isModified("karma.post") || this.isModified("karma.comment")) {
    this.karma.total = this.karma.post + this.karma.comment;
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Virtual for user profile URL
userSchema.virtual("profileUrl").get(function () {
  return `/u/${this.username}`;
});

// Convert to JSON and remove sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.__v;
  return obj;
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// ============================================
// 📁 src/validators/userSchemas.ts (FIXED)
// ============================================
import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  )
  .transform((val) => val.toLowerCase().trim());

export const createUserSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: z.string().email("Invalid email format").transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    displayName: z
      .string()
      .max(50, "Display name must not exceed 50 characters")
      .optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    displayName: z
      .string()
      .max(50, "Display name must not exceed 50 characters")
      .optional(),
    bio: z.string().max(400, "Bio must not exceed 400 characters").optional(),
    avatarUrl: z.string().url("Invalid avatar URL").max(500).optional(),
    bannerUrl: z.string().url("Invalid banner URL").max(500).optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    preferences: z
      .object({
        nsfw: z.boolean().optional(),
        darkMode: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
        showAdultContent: z.boolean().optional(),
        language: z.string().length(2, "Language must be 2 characters").optional(),
      })
      .optional(),
  }),
});

export const followUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});

export const usernameParamSchema = z.object({
  params: z.object({
    username: usernameSchema,
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>["body"];

// ============================================
// 📁 src/validators/authSchemas.ts (FIXED)
// ============================================
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .transform((val) => val.toLowerCase().trim());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers");

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    username: usernameSchema,
    displayName: z
      .string()
      .max(50, "Display name must not exceed 50 characters")
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const confirmResetSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>["body"];

// ============================================
// 📁 src/controllers/userController.ts (FIXED)
// ============================================
import { Response } from "express";
import { User } from "../models/User.js";
import { AuthRequest, IUserResponse, IUser } from "../types/index.js";
import {
  UpdateUserInput,
  UpdatePreferencesInput,
} from "../validators/userSchemas.js";

const formatUserResponse = (user: IUser): IUserResponse => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  bannerUrl: user.bannerUrl,
  karma: user.karma,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-passwordHash -refreshTokens -otp -otpExpiry")
      .populate("joinedSubreddits", "name displayName icon")
      .populate("moderatedSubreddits", "name displayName icon")
      .lean();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "If the email exists, a reset OTP has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

export const confirmPasswordReset = async (
  req: Request<{}, {}, ConfirmResetInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ error: "No reset OTP found. Please request a new one." });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    if (user.otpExpiry < new Date()) {
      res.status(400).json({ error: "OTP has expired. Please request a new one." });
      return;
    }

    user.passwordHash = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

export const resendOtp = async (
  req: Request<{}, {}, { email: string }>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Email already verified" });
      return;
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const template = emailTemplates.verificationOtp(otp);
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

// ============================================
// 📁 src/routes/userRoutes.ts (FIXED)
// ============================================
import express from "express";
import {
  getUserProfile,
  getCurrentUser,
  updateUserProfile,
  updateUserPreferences,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  deleteUserAccount,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  updateUserSchema,
  updatePreferencesSchema,
  followUserSchema,
  usernameParamSchema,
  deleteAccountSchema,
} from "../validators/userSchemas.js";

const router = express.Router();

// FIXED: Protected routes BEFORE param routes to avoid conflicts
router.get("/me/profile", protect, getCurrentUser);
router.put(
  "/me/profile",
  protect,
  validateRequest(updateUserSchema),
  updateUserProfile
);
router.put(
  "/me/preferences",
  protect,
  validateRequest(updatePreferencesSchema),
  updateUserPreferences
);
router.delete(
  "/me/account",
  protect,
  validateRequest(deleteAccountSchema),
  deleteUserAccount
);

// Public routes
router.get("/:username", validateRequest(usernameParamSchema), getUserProfile);
router.get(
  "/:username/followers",
  validateRequest(usernameParamSchema),
  getUserFollowers
);
router.get(
  "/:username/following",
  validateRequest(usernameParamSchema),
  getUserFollowing
);

// Follow/unfollow routes
router.post(
  "/:userId/follow",
  protect,
  validateRequest(followUserSchema),
  followUser
);
router.delete(
  "/:userId/unfollow",
  protect,
  validateRequest(followUserSchema),
  unfollowUser
);

export default router;

// ============================================
// 📁 src/routes/authRoutes.ts
// ============================================
import express from "express";
import {
  registerUser,
  verifyEmailOtp,
  loginUser,
  logoutUser,
  requestPasswordReset,
  confirmPasswordReset,
  resendOtp,
} from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  confirmResetSchema,
} from "../validators/authSchemas.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/verify", validateRequest(verifyOtpSchema), verifyEmailOtp);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  requestPasswordReset
);
router.post(
  "/confirm-reset",
  validateRequest(confirmResetSchema),
  confirmPasswordReset
);
router.post("/resend-otp", resendOtp);

export default router;

// ============================================
// 📁 src/middlewares/authMiddleware.ts
// ============================================
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AuthRequest, JWTPayload } from "../types/index.js";

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ error: "Not authorized, no token" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: "User is banned" });
      return;
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

// ============================================
// 📁 src/middlewares/validateRequest.ts
// ============================================
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

// ============================================
// 📁 src/middlewares/errorHandler.ts
// ============================================
import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

// ============================================
// 📁 src/utils/generateToken.ts
// ============================================
import jwt from "jsonwebtoken";

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// ============================================
// 📁 src/utils/generateOtp.ts
// ============================================
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================
// 📁 src/utils/emailService.ts
// ============================================
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: `"Feddit" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// ============================================
// 📁 src/utils/emailTemplates.ts
// ============================================
export const emailTemplates = {
  verificationOtp: (otp: string) => ({
    subject: "Verify Your Feddit Account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff4500; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .otp { font-size: 32px; font-weight: bold; color: #ff4500; text-align: center; letter-spacing: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Feddit!</h1>
            </div>
            <div class="content">
              <p>Thank you for registering! Please use the following OTP to verify your email:</p>
              <p class="otp">${otp}</p>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Feddit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  resetPasswordOtp: (otp: string) => ({
    subject: "Reset Your Feddit Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff4500; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .otp { font-size: 32px; font-weight: bold; color: #ff4500; text-align: center; letter-spacing: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>We received a request to reset your password. Use the following OTP:</p>
              <p class="otp">${otp}</p>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Feddit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// ============================================
// 📁 src/config/db.ts
// ============================================
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

// ============================================
// 📁 src/index.ts (COMPLETE)
// ============================================
import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

connectDB();

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API documentation
app.get("/", (req, res) => {
  res.json({
    message: "🔥 Feddit Backend API - Production Ready",
    version: "1.0.0",
    documentation: {
      auth: {
        register: "POST /api/auth/register",
        verify: "POST /api/auth/verify",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        resetPassword: "POST /api/auth/reset-password",
        confirmReset: "POST /api/auth/confirm-reset",
        resendOtp: "POST /api/auth/resend-otp",
      },
      users: {
        getCurrentUser: "GET /api/users/me/profile (protected)",
        updateProfile: "PUT /api/users/me/profile (protected)",
        updatePreferences: "PUT /api/users/me/preferences (protected)",
        deleteAccount: "DELETE /api/users/me/account (protected)",
        getProfile: "GET /api/users/:username",
        followUser: "POST /api/users/:userId/follow (protected)",
        unfollowUser: "DELETE /api/users/:userId/unfollow (protected)",
        getFollowers: "GET /api/users/:username/followers",
        getFollowing: "GET /api/users/:username/following",
      },
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\n👋 Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err: Error) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  gracefulShutdown();
});

process.on("uncaughtException", (err: Error) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown();
});

// ============================================
// 📁 .env.example
// ============================================
/*
PORT=5000
MONGO_URI=mongodb://localhost:27017/feddit
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
*/

// ============================================
// 📁 package.json
// ============================================
/*
{
  "name": "feddit-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint . --ext .ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/nodemailer": "^6.4.14",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.2",
    "tsx": "^4.7.0"
  }
}
*/

// ============================================
// 📁 tsconfig.json
// ============================================
/*
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
*/ true,
      user: formatUserResponse(user as IUser),
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .select("-passwordHash -refreshTokens -otp -otpExpiry")
      .populate("joinedSubreddits", "name displayName icon")
      .populate("moderatedSubreddits", "name displayName icon");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

export const updateUserProfile = async (
  req: AuthRequest<{}, {}, UpdateUserInput>,
  res: Response
): Promise<void> => {
  try {
    const { displayName, bio, avatarUrl, bannerUrl } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bannerUrl !== undefined) user.bannerUrl = bannerUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateUserPreferences = async (
  req: AuthRequest<{}, {}, UpdatePreferencesInput>,
  res: Response
): Promise<void> => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

// ATOMIC FOLLOW/UNFOLLOW OPERATIONS (FIXED)
export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (userId === currentUserId) {
      res.status(400).json({ error: "You cannot follow yourself" });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Atomic operations to prevent race conditions
    const currentUserUpdate = await User.findByIdAndUpdate(
      currentUserId,
      {
        $addToSet: { following: userId },
        $inc: { followingCount: 1 },
      },
      { new: true }
    );

    if (!currentUserUpdate) {
      res.status(404).json({ error: "Current user not found" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId },
      $inc: { followersCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (userId === currentUserId) {
      res.status(400).json({ error: "You cannot unfollow yourself" });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Atomic operations
    const currentUserUpdate = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: { following: userId },
        $inc: { followingCount: -1 },
      },
      { new: true }
    );

    if (!currentUserUpdate) {
      res.status(404).json({ error: "Current user not found" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
      $inc: { followersCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

export const getUserFollowers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username })
      .populate({
        path: "followers",
        select: "username displayName avatarUrl karma",
        options: { limit, skip },
      })
      .lean();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      followers: user.followers,
      count: user.followersCount,
      page,
      totalPages: Math.ceil(user.followersCount / limit),
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

export const getUserFollowing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username })
      .populate({
        path: "following",
        select: "username displayName avatarUrl karma",
        options: { limit, skip },
      })
      .lean();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      following: user.following,
      count: user.followingCount,
      page,
      totalPages: Math.ceil(user.followingCount / limit),
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
};

export const deleteUserAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // FIXED: Explicitly select passwordHash for verification
    const user = await User.findById(req.user?.id).select("+passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password } = req.body;
    
    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    await User.findByIdAndDelete(req.user?.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// ============================================
// 📁 src/controllers/authController.ts (FIXED)
// ============================================
// ============================================
// 📁 src/controllers/authController.ts (COMPLETE)
// ============================================
import { Request, Response } from "express";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/emailService.js";
import { emailTemplates } from "../utils/emailTemplates.js";
import {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResetPasswordInput,
  ConfirmResetInput,
} from "../validators/authSchemas.js";

// ============================================
// REGISTER USER
// ============================================
export const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, username, displayName } = req.body;

    // Check if user already exists (email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ 
          success: false,
          error: "Email already registered" 
        });
        return;
      }
      if (existingUser.username === username) {
        res.status(400).json({ 
          success: false,
          error: "Username already taken" 
        });
        return;
      }
    }

    // Generate OTP for email verification
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const user = await User.create({
      email,
      username,
      passwordHash: password,
      displayName: displayName || username,
      otp,
      otpExpiry,
    });

    // Send verification email
    const template = emailTemplates.verificationOtp(otp);
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! OTP sent to your email.",
      data: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      error: "Registration failed" 
    });
  }
};

// ============================================
// VERIFY EMAIL OTP
// ============================================
export const verifyEmailOtp = async (
  req: Request<{}, {}, VerifyOtpInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user with OTP fields
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      res.status(400).json({ 
        success: false,
        error: "User not found" 
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400).json({ 
        success: false,
        error: "Email already verified" 
      });
      return;
    }

    // Validate OTP exists
    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ 
        success: false,
        error: "No OTP found. Please request a new one." 
      });
      return;
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      res.status(400).json({ 
        success: false,
        error: "Invalid OTP" 
      });
      return;
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      res.status(400).json({ 
        success: false,
        error: "OTP has expired. Please request a new one." 
      });
      return;
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      success: false,
      error: "Verification failed" 
    });
  }
};

// ============================================
// LOGIN USER
// ============================================
export const loginUser = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select passwordHash
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
      return;
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
      return;
    }

    // Check if email is verified
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        error: "Email not verified. Please verify your email first.",
      });
      return;
    }

    // Check if user is banned
    if (user.isBanned) {
      res.status(403).json({
        success: false,
        error: "Your account has been banned. Please contact support.",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
        karma: user.karma,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      error: "Login failed" 
    });
  }
};

// ============================================
// LOGOUT USER
// ============================================
export const logoutUser = (req: Request, res: Response): void => {
  // In a JWT-based system, logout is handled client-side by removing the token
  // If using refresh tokens, you would invalidate them here
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ============================================
// REQUEST PASSWORD RESET
// ============================================
export const requestPasswordReset = async (
  req: Request<{}, {}, ResetPasswordInput>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      res.status(200).json({
        success: true,
        message: "If the email exists, a reset OTP has been sent.",
      });
      return;
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send reset email
    const template = emailTemplates.resetPasswordOtp(otp);
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(200).json({
      success: true,
      message: "If the email exists, a reset OTP has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to process password reset request" 
    });
  }
};

// ============================================
// CONFIRM PASSWORD RESET
// ============================================
export const confirmPasswordReset = async (
  req: Request<{}, {}, ConfirmResetInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user with OTP fields
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      res.status(400).json({ 
        success: false,
        error: "Invalid request" 
      });
      return;
    }

    // Validate OTP exists
    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ 
        success: false,
        error: "No reset OTP found. Please request a new one." 
      });
      return;
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      res.status(400).json({ 
        success: false,
        error: "Invalid OTP" 
      });
      return;
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      res.status(400).json({ 
        success: false,
        error: "OTP has expired. Please request a new one." 
      });
      return;
    }

    // Update password and clear OTP
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Password reset failed" 
    });
  }
};

// ============================================
// RESEND OTP (Bonus Feature)
// ============================================
export const resendOtp = async (
  req: Request<{}, {}, { email: string }>,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user with OTP fields
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      res.status(400).json({ 
        success: false,
        error: "User not found" 
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400).json({ 
        success: false,
        error: "Email already verified" 
      });
      return;
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send verification email
    const template = emailTemplates.verificationOtp(otp);
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to resend OTP" 
    });
  }
};