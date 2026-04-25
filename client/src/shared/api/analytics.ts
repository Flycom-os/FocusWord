import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface AnalyticsEntryDto {
  id: number;
  date: string;
  totalViews: number;
  uniqueViews: number;
  bounceRate?: number | null;
  avgTimeOnPage?: number | null;
  pageId?: number | null;
  postId?: number | null;
}

export interface ReferrerDetailDto {
  id: number;
  referrerUrl: string;
  count: number;
  analyticsEntryId?: number | null;
}

export interface CreateAnalyticsEntryDto {
  date: string;
  totalViews?: number;
  uniqueViews?: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
  pageId?: number;
  postId?: number;
}

export interface UpdateAnalyticsEntryDto {
  totalViews?: number;
  uniqueViews?: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
}

export interface PaginatedAnalyticsResponse {
  data: AnalyticsEntryDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalyticsQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  pageId?: number;
  postId?: number;
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueViews: number;
  avgBounceRate: number;
  avgTimeOnPage: number;
  topPages: Array<{
    id: number;
    title: string;
    views: number;
  }>;
  topReferrers: Array<{
    url: string;
    count: number;
  }>;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const analyticsApi = {
  // Получить все записи аналитики
  getAll: async (token: string | null, params: AnalyticsQuery = {}): Promise<PaginatedAnalyticsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.pageId && { pageId: params.pageId.toString() }),
      ...(params.postId && { postId: params.postId.toString() })
    });
    
    const { data } = await axios.get<PaginatedAnalyticsResponse>(`${API_URL}/analytics?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить запись аналитики по ID
  getById: async (token: string | null, id: number): Promise<AnalyticsEntryDto> => {
    const { data } = await axios.get<AnalyticsEntryDto>(`${API_URL}/analytics/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать запись аналитики
  create: async (token: string | null, data: CreateAnalyticsEntryDto): Promise<AnalyticsEntryDto> => {
    const { data: result } = await axios.post<AnalyticsEntryDto>(`${API_URL}/analytics`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить запись аналитики
  update: async (token: string | null, id: number, data: UpdateAnalyticsEntryDto): Promise<AnalyticsEntryDto> => {
    const { data: result } = await axios.put<AnalyticsEntryDto>(`${API_URL}/analytics/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить запись аналитики
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/analytics/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Получить статистику
  getStats: async (token: string | null, params: { startDate?: string; endDate?: string } = {}): Promise<AnalyticsStats> => {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });
    
    const { data } = await axios.get<AnalyticsStats>(`${API_URL}/analytics/stats?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить рефереры для записи аналитики
  getReferrers: async (token: string | null, analyticsId: number): Promise<ReferrerDetailDto[]> => {
    const { data } = await axios.get<ReferrerDetailDto[]>(`${API_URL}/analytics/${analyticsId}/referrers`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Добавить реферер
  addReferrer: async (token: string | null, analyticsId: number, referrerUrl: string): Promise<ReferrerDetailDto> => {
    const { data } = await axios.post<ReferrerDetailDto>(`${API_URL}/analytics/${analyticsId}/referrers`, { referrerUrl }, {
      headers: authHeaders(token),
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchAnalytics = analyticsApi.getAll;
export const fetchAnalyticsEntry = analyticsApi.getById;
export const createAnalyticsEntry = analyticsApi.create;
export const updateAnalyticsEntry = analyticsApi.update;
export const deleteAnalyticsEntry = analyticsApi.delete;
export const fetchAnalyticsStats = analyticsApi.getStats;
export const fetchReferrers = analyticsApi.getReferrers;
export const addReferrer = analyticsApi.addReferrer;
