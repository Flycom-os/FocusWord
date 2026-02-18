import axios from 'axios';
import { SearchQueryDto } from '@/src/shared/lib/types'; // Assuming types are here or create a new file

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Assuming API runs on port 3000

export interface User {
    id: number;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    avatarUrl?: string;
    role?: {
      id: number;
      name: string;
    }
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getUsers = async (params: SearchQueryDto): Promise<GetUsersResponse> => {
  const response = await axios.get(`${API_URL}/user/all`, { params });
  return response.data;
};

// You might also need similar functions for roles, but let's focus on users first.
export const getRoles = async (params: SearchQueryDto): Promise<any> => {
  const response = await axios.get(`${API_URL}/roles`, { params });
  return response.data;
};
