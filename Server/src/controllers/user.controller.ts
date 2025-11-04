import express , {Request , Response} from "express";
import User, {IUser} from "../models/user.model";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { AuthRequest } from "../middleware/auth.middleware";

export const signup = async(req:Request , res:Response) =>{
    try{
        const {name , email , password , role , profileImage , bio} = req.body;
        if(!name || !email || !password ){
            return res.status(401).json({
                message:"All fields are mandatory to be filled" 
            })
        }
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(401).json({
                message:"Email already exists"
            })
        }
        const hashPassword = await bcrypt.hash(password, 10 );
        const user:IUser = await User.create({
            name, 
            email , 
            password:hashPassword , 
            role, 
            profileImage , 
            bio,
        });
        generateTokenAndSetCookie((user._id as string), user.role, res);

        res.status(201).json({
            success:true , 
            message:"User registered successfully" , 
            user:{
                id:user._id , 
                name:user.name , 
                email:user.email , 
                role : user.role , 
                profileImage : user.profileImage , 
                bio:user.bio,
            }
        }) ;
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message:"Something went wrong durign signup"
        })
    }
}
export const signin = async(req:Request , res:Response) =>{
    try{
        const {email, password}  = req.body;
        const user:IUser | null = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"User not found"
            })
        }
        const isMatch = await bcrypt.compare(password , user.password);

        generateTokenAndSetCookie((user._id as string), user.role, res);

        res.json({
                id:user._id , 
                name:user.name , 
                email:user.email , 
                role : user.role , 
                profileImage : user.profileImage , 
                bio:user.bio,
        })
    }
    catch(error){
        if(error instanceof Error){
            return res.json({
                message:error,
            }
            )
        }
        else{
            res.json({
                message:"unknown error occured"
            })
        }
    }
}
export const logout = async(req:Request , res:Response) =>{
    try{
        res.clearCookie("token",{
            httpOnly:true , 
            secure:true , 
            sameSite:"none" ,
        });
        res.status(200).json({
            success:true , 
            message:"Logged out successfully"
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false , 
            message:"Error whiel logging out",
            error
        })
    }
}
export const getMe = async(req:AuthRequest, res:Response) =>{
    try{
        const Id = req.user?.userId ; 
        const user = await User.findById(Id).select("-password");
        res.json(user);
    }
    catch(error){
        if(error instanceof Error){
            console.log(error);
            res.json({
                error:error.message
            })
        }
        else{
            console.log("Unknown error")
        }
    }
}