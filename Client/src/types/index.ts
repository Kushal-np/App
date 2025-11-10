export type Role = "admin" | "instructor" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  profileImage?: string;
  bio?: string;
}

export interface AuthState {
  user: User | null;  
  loading: boolean;
  error: string | null;
}

export interface Course{
  title:string ; 
  description: string ;
  instructor: string ; 
  students: string[];
  category:string ; 
  thumbnailUrl :string ; 
  videourls:string ; 
  _id:string ; 
}

export interface CourseState{
  courses : Course[] ; 
  selectedCourse : Course | null ; 
  loading : boolean ; 
  error: string | null ; 
}