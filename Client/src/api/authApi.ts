import axios from "axios";
import type { AxiosResponse } from "axios";

import type { User } from "../types";

export const api = axios.create({
  baseURL: "http://localhost:7000",
  withCredentials: true,
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
  profileImage?: string;
  bio?: string;
}

export const loginUser = async (data: LoginCredentials): Promise<User> => {
  const res = await api.post<User>("/auth/login", data);
  return res.data;
};

export const signupUser = async (data: SignupData): Promise<User> => {
  const res = await api.post<User>("/auth/signup", data);
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>("/auth/me");
  return res.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};