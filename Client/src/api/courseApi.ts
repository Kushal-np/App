import axios from "axios";
import type { AxiosResponse } from "axios";

import type { Course } from "../types";


export const api = axios.create({
    baseURL : "http://localhost:7000/course",
    withCredentials:true 
})


export interface CreateDetails {
  title:string ; 
  description: string ;
  instructor: string ; 
  students: string[];
  category:string ; 
  thumbnailUrl :string ; 
  videourls:string ; 
  _id:string ; 
}

export interface UpdateDetails{
  title?:string ; 
  description?: string ;
  instructor?: string ; 
  students?: string[];
  category?:string ; 
  thumbnailUrl? :string ; 
  videourls?:string ; 
  _id?:string ; 
}


export const createPost = async(data: CreateDetails) : Promise<Course> => {
    const res = await api.post<Course>("/create");
    return res.data ; 
}

export const updatePost = async(data:UpdateDetails) : Promise<Course> =>{
    const res= await api.post<Course>("/update/:id");
    return res.data ; 
}

export const deletePost = async() : Promise<Course> =>{
    const res = await api.delete<Course>("/delete/:id");
    return res.data ; 
}

export const getAllCourses = async(): Promise<Course> =>{
    const res = await api.get<Course>("/AllCourses") ; 
    return res.data;
}
export const getCoursesById = async():Promise<Course> =>{
    const res = await api.get<Course>("/CourseDetail/:courseId") ;
    return res.data;
}
export const GetCoursesMadeByMe = async() :Promise<Course> =>{
    const res = await api.get<Course>("/MyCourses/:id");
    return res.data ; 
}

export const MyEnrolledCourses = async(): Promise<Course> =>{
    const res = await api.get<Course>("/my-courses");
    return res.data ; 
}

export const EnrollOnACourse = async():Promise<Course> =>{
    const res = await api.post<Course>("/enrollInACourse/:id");
    return res.data ; 
}