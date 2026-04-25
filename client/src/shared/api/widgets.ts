import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface WidgetDto {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'image' | 'slider' | 'gallery' | 'form' | 'social' | 'custom';
  content: any;
  config: any;
  status: 'active' | 'inactive';
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWidgetDto {
  name: string;
  slug: string;
  type: 'text' | 'image' | 'slider' | 'gallery' | 'form' | 'social' | 'custom';
  content: any;
  config: any;
  status: 'active' | 'inactive';
  position: number;
}

export interface UpdateWidgetDto {
  name?: string;
  slug?: string;
  type?: 'text' | 'image' | 'slider' | 'gallery' | 'form' | 'social' | 'custom';
  content?: any;
  config?: any;
  status?: 'active' | 'inactive';
  position?: number;
}

export interface PaginatedWidgetsResponse {
  data: WidgetDto[];
  total: number;
  page: number;
  limit: number;
}

export interface WidgetQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: 'active' | 'inactive';
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const widgetsApi = {
  // Получить все виджеты с пагинацией
  getAll: async (token: string | null, params: WidgetQuery = {}): Promise<PaginatedWidgetsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status })
    });
    
    const { data } = await axios.get<PaginatedWidgetsResponse>(`${API_URL}/widgets?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить виджет по ID
  getById: async (token: string | null, id: number): Promise<WidgetDto> => {
    const { data } = await axios.get<WidgetDto>(`${API_URL}/widgets/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать новый виджет
  create: async (token: string | null, data: CreateWidgetDto): Promise<WidgetDto> => {
    const { data: result } = await axios.post<WidgetDto>(`${API_URL}/widgets`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить виджет
  update: async (token: string | null, id: number, data: UpdateWidgetDto): Promise<WidgetDto> => {
    const { data: result } = await axios.put<WidgetDto>(`${API_URL}/widgets/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить виджет
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/widgets/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Изменить статус виджета
  changeStatus: async (token: string | null, id: number, status: 'active' | 'inactive'): Promise<WidgetDto> => {
    const { data: result } = await axios.patch<WidgetDto>(`${API_URL}/widgets/${id}/status`, { status }, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Изменить позицию виджета
  changePosition: async (token: string | null, id: number, position: number): Promise<WidgetDto> => {
    const { data: result } = await axios.patch<WidgetDto>(`${API_URL}/widgets/${id}/position`, { position }, {
      headers: authHeaders(token),
    });
    return result;
  },
};

// Экспортируем функции для совместимости
export const fetchWidgets = widgetsApi.getAll;
export const fetchWidget = widgetsApi.getById;
export const createWidget = widgetsApi.create;
export const updateWidget = widgetsApi.update;
export const deleteWidget = widgetsApi.delete;
export const changeWidgetStatus = widgetsApi.changeStatus;
export const changeWidgetPosition = widgetsApi.changePosition;
