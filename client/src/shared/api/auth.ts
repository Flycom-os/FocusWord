import axios from "axios";
import { AuthResponse } from "@/src/shared/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  surname: string;
  permission?: 0 | 1 | 2;
}

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/login`, payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/register`, payload);
  return data;
};


