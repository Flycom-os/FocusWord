import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface FeedbackDto {
  id: number;
  name: string;
  email: string;
  message: string;
  rating?: number | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  name: string;
  email: string;
  message: string;
  rating?: number;
}

export interface UpdateFeedbackDto {
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PaginatedFeedbackResponse {
  data: FeedbackDto[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const feedbackApi = {
  // Получить все отзывы с пагинацией
  getAll: async (token: string | null, params: FeedbackQuery = {}): Promise<PaginatedFeedbackResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status })
    });
    
    const { data } = await axios.get<PaginatedFeedbackResponse>(`${API_URL}/feedback?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить отзыв по ID
  getById: async (token: string | null, id: number): Promise<FeedbackDto> => {
    const { data } = await axios.get<FeedbackDto>(`${API_URL}/feedback/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать новый отзыв
  create: async (data: CreateFeedbackDto): Promise<FeedbackDto> => {
    const { data: result } = await axios.post<FeedbackDto>(`${API_URL}/feedback`, data);
    return result;
  },

  // Обновить отзыв
  update: async (token: string | null, id: number, data: UpdateFeedbackDto): Promise<FeedbackDto> => {
    const { data: result } = await axios.put<FeedbackDto>(`${API_URL}/feedback/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить отзыв
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/feedback/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Изменить статус отзыва
  changeStatus: async (token: string | null, id: number, status: 'pending' | 'approved' | 'rejected'): Promise<FeedbackDto> => {
    const { data: result } = await axios.patch<FeedbackDto>(`${API_URL}/feedback/${id}/status`, { status }, {
      headers: authHeaders(token),
    });
    return result;
  },
};

// Экспортируем функции для совместимости
export const fetchFeedback = feedbackApi.getAll;
export const fetchFeedbackById = feedbackApi.getById;
export const createFeedback = feedbackApi.create;
export const updateFeedback = feedbackApi.update;
export const deleteFeedback = feedbackApi.delete;
export const changeFeedbackStatus = feedbackApi.changeStatus;
