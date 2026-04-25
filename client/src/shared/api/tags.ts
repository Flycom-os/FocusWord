import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface TagDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface PaginatedTagsResponse {
  data: TagDto[];
  total: number;
  page: number;
  limit: number;
}

export interface TagsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const tagsApi = {
  // Получить все теги с пагинацией
  getAll: async (token: string | null, params: TagsQuery = {}): Promise<PaginatedTagsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search })
    });
    
    const { data } = await axios.get<PaginatedTagsResponse>(`${API_URL}/tags?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить тег по ID
  getById: async (token: string | null, id: number): Promise<TagDto> => {
    const { data } = await axios.get<TagDto>(`${API_URL}/tags/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать новый тег
  create: async (token: string | null, data: CreateTagDto): Promise<TagDto> => {
    const { data: result } = await axios.post<TagDto>(`${API_URL}/tags`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить тег
  update: async (token: string | null, id: number, data: UpdateTagDto): Promise<TagDto> => {
    const { data: result } = await axios.put<TagDto>(`${API_URL}/tags/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить тег
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/tags/${id}`, {
      headers: authHeaders(token),
    });
  },
};

// Экспортируем функции для совместимости
export const fetchTags = tagsApi.getAll;
export const fetchTag = tagsApi.getById;
export const createTag = tagsApi.create;
export const updateTag = tagsApi.update;
export const deleteTag = tagsApi.delete;
