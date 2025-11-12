// types/index.ts

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

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  students: string[];
  category: string;
  thumbnail: string; // Changed from thumbnailUrl to match usage
  mediaFiles: string[]; // Changed from videourls to match usage
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseState {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
}

export interface CourseCreationState {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  mediaFiles: File[];
  loading: boolean;
  success: boolean;
  error: string | null;
}