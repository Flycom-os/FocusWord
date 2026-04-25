import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface StructuredDataDto {
  id: number;
  type: string;
  jsonLd: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pageId?: number | null;
  postId?: number | null;
}

export interface CreateStructuredDataDto {
  type: string;
  jsonLd: any;
  isActive?: boolean;
  pageId?: number;
  postId?: number;
}

export interface UpdateStructuredDataDto {
  type?: string;
  jsonLd?: any;
  isActive?: boolean;
  pageId?: number;
  postId?: number;
}

export interface PaginatedStructuredDataResponse {
  data: StructuredDataDto[];
  total: number;
  page: number;
  limit: number;
}

export interface StructuredDataQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  pageId?: number;
  postId?: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const structuredDataApi = {
  // Получить все структурированные данные
  getAll: async (token: string | null, params: StructuredDataQuery = {}): Promise<PaginatedStructuredDataResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.type && { type: params.type }),
      ...(params.isActive !== undefined && { isActive: params.isActive.toString() }),
      ...(params.pageId && { pageId: params.pageId.toString() }),
      ...(params.postId && { postId: params.postId.toString() })
    });
    
    const { data } = await axios.get<PaginatedStructuredDataResponse>(`${API_URL}/structured-data?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить структурированные данные по ID
  getById: async (token: string | null, id: number): Promise<StructuredDataDto> => {
    const { data } = await axios.get<StructuredDataDto>(`${API_URL}/structured-data/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать структурированные данные
  create: async (token: string | null, data: CreateStructuredDataDto): Promise<StructuredDataDto> => {
    const { data: result } = await axios.post<StructuredDataDto>(`${API_URL}/structured-data`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить структурированные данные
  update: async (token: string | null, id: number, data: UpdateStructuredDataDto): Promise<StructuredDataDto> => {
    const { data: result } = await axios.put<StructuredDataDto>(`${API_URL}/structured-data/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить структурированные данные
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/structured-data/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Включить/выключить структурированные данные
  toggleActive: async (token: string | null, id: number, isActive: boolean): Promise<StructuredDataDto> => {
    const { data } = await axios.patch<StructuredDataDto>(`${API_URL}/structured-data/${id}/toggle`, { isActive }, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить типы структурированных данных
  getTypes: async (): Promise<string[]> => {
    const { data } = await axios.get<string[]>(`${API_URL}/structured-data/types`);
    return data;
  },

  // Валидировать JSON-LD
  validateJsonLd: async (jsonLd: any): Promise<{ isValid: boolean; errors?: string[] }> => {
    const { data } = await axios.post<{ isValid: boolean; errors?: string[] }>(`${API_URL}/structured-data/validate`, { jsonLd });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchStructuredData = structuredDataApi.getAll;
export const fetchStructuredDataEntry = structuredDataApi.getById;
export const createStructuredData = structuredDataApi.create;
export const updateStructuredData = structuredDataApi.update;
export const deleteStructuredData = structuredDataApi.delete;
export const toggleStructuredDataActive = structuredDataApi.toggleActive;
export const fetchStructuredDataTypes = structuredDataApi.getTypes;
export const validateStructuredData = structuredDataApi.validateJsonLd;
