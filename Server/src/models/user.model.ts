import mongoose , {Schema , Document} from "mongoose";

export interface IUser extends Document{
    name:string ;
    email:string ; 
    password:string ; 
    role: "student" | "instructor" | "admin" ; 
    profileImage ?:string; 
    bio?:string ; 
    createdAt:Date ; 
    updatedAt:Date ; 
}

const userSchema = new Schema<IUser>({
    name:{
        type:String , 
        required:true , 
    },
    email:{
        type:String , 
        required:true , 
        unique:true , 
    },
    password:{
        type:String , 
        required:true , 
    },
    role:{
        type:String , 
        enum:["student" , "instructor", "admin"],
        default:"student"
    },
    profileImage: {
        type:String , 
    }, 
    bio:{
        type:String ,
    }
}, {
    timestamps:true
})


const User = mongoose.model<IUser>("User" , userSchema);
export default User ; 
