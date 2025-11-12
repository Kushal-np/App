import axios from "axios";
import type { AxiosResponse } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:7000/course",
  withCredentials: true,
});

// Request interface for creating a course (what we send)
export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  thumbnail?: File;
  mediaFiles?: File[];
}

// Response interface (what we get back from API)
export interface CreateCourseResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  students: string[];
  thumbnailUrl: string;
  videourls: string[];
  createdAt: string;
  updatedAt: string;
}

// Legacy interface for compatibility
export interface CreateDetails {
  title: string;
  description: string;
  instructor: string;
  students: string[];
  category: string;
  thumbnailUrl: string;
  videourls: string;
  _id: string;
}

export interface UpdateDetails {
  title?: string;
  description?: string;
  instructor?: string;
  students?: string[];
  category?: string;
  thumbnailUrl?: string;
  videourls?: string;
  _id?: string;
}

// Create a new course
export const createPost = async (
  data: FormData
): Promise<CreateCourseResponse> => {
  const res = await api.post<CreateCourseResponse>("/create", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Update a course
export const updatePost = async (
  id: string,
  data: UpdateDetails
): Promise<CreateCourseResponse> => {
  const res = await api.put<CreateCourseResponse>(`/update/${id}`, data);
  return res.data;
  console.log("This is nothing",res.data)
};

// Delete a course
export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/delete/${id}`);
};

// Get all courses
export const getAllCourses = async (): Promise<CreateCourseResponse[]> => {
  const res = await api.get<CreateCourseResponse[]>("/AllCourses");
  return res.data;
};

// Get course by ID
export const getCoursesById = async (
  courseId: string
): Promise<CreateCourseResponse> => {
  const res = await api.get<CreateCourseResponse>(`/CourseDetail/${courseId}`);
  return res.data;
};

// Get courses made by me
export const GetCoursesMadeByMe = async (
  userId: string
): Promise<CreateCourseResponse[]> => {
  const res = await api.get<CreateCourseResponse[]>(`/MyCourses/${userId}`);
  console.log("this got envoked");
  return res.data;
};

// Get my enrolled courses
export const MyEnrolledCourses = async (): Promise<CreateCourseResponse[]> => {
  const res = await api.get<CreateCourseResponse[]>("/my-courses");
  return res.data;
};

// Enroll in a course
export const EnrollOnACourse = async (
  courseId: string
): Promise<CreateCourseResponse> => {
  const res = await api.post<CreateCourseResponse>(
    `/enrollInACourse/${courseId}`
  );
  return res.data;
};

// Search courses
export const searchCourses = async (
  query: string
): Promise<CreateCourseResponse[]> => {
  const res = await api.get<CreateCourseResponse[]>(
    `/search?query=${encodeURIComponent(query)}`
  );
  return res.data;
};