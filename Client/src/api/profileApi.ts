import axios from "axios";
import type { AxiosResponse } from "axios";
import type { User } from "../types";


export const api = axios.create({
    baseURL:"http://localhost:7000/profile" , 
    withCredentials:true

})


export const getUserProfile = async(id:string) :Promise<User> =>{
    const res = await api.get<User>(`/user/${id}`);
    
    return res.data ; 
    
}