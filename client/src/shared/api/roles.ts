import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface RoleDto {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RolesQuery {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export interface PaginatedRolesResponse {
  roles: RoleDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchRoles = async (token: string | null, params: RolesQuery): Promise<RoleDto[]> => {
  const { data } = await axios.get<PaginatedRolesResponse>(`${API_URL}/roles`, {
    params: {
      ...params,
      page: params.page || 1,
      limit: params.limit || 20,
    },
    headers: authHeaders(token),
  });
  return data.roles || [];
};

export const fetchRole = async (token: string | null, id: number): Promise<RoleDto> => {
  const { data } = await axios.get<RoleDto>(`${API_URL}/roles/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const createRole = async (
  token: string | null,
  payload: {
    name: string;
    description?: string;
    permissions?: string[];
  },
): Promise<RoleDto> => {
  const { data } = await axios.post<RoleDto>(`${API_URL}/roles`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const updateRole = async (
  token: string | null,
  id: number,
  payload: Partial<{
    name: string;
    description: string;
    permissions: string[];
  }>,
): Promise<RoleDto> => {
  const { data } = await axios.patch<RoleDto>(`${API_URL}/roles/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deleteRole = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/roles/${id}`, {
    headers: authHeaders(token),
  });
};

