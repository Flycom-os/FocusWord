import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface UserDto {
  id: number;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  roleId: number | null;
  role?: {
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
  } | null;
}

export interface UsersQuery {
  name?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersResponse {
  users: UserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const fetchUsers = async (token: string | null, params: UsersQuery): Promise<UserDto[]> => {
  const { data } = await axios.get<PaginatedUsersResponse>(`${API_URL}/user/all`, {
    params: {
      ...params,
      name: params.name || params.search,
      page: params.page || 1,
      limit: params.limit || 20,
    },
    headers: authHeaders(token),
  });
  return data.users || [];
};

export const fetchUser = async (token: string | null, id: number): Promise<UserDto> => {
  const { data } = await axios.get<UserDto>(`${API_URL}/user/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const createUser = async (
  token: string | null,
  payload: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    roleName?: string;
  },
): Promise<UserDto> => {
  const { data } = await axios.post<UserDto>(`${API_URL}/user/`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const updateUser = async (
  token: string | null,
  id: number,
  payload: Partial<{
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    roleId: number;
    avatarUrl: string;
    face?: File;
  }>,
): Promise<UserDto> => {
  const formData = new FormData();
  
  // Добавляем файл, если он есть
  if (payload.face) {
    formData.append('face', payload.face);
  }
  
  // Добавляем остальные поля
  Object.keys(payload).forEach((key) => {
    if (key !== 'face') {
      const value = payload[key as keyof typeof payload];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    }
  });

  const { data } = await axios.patch<UserDto>(`${API_URL}/user/${id}`, formData, {
    headers: {
      ...authHeaders(token),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteUser = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/user/${id}`, {
    headers: authHeaders(token),
  });
};

