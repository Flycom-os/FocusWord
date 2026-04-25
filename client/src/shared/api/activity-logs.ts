import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface ActivityLogDto {
  id: number;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  details?: any;
  timestamp: string;
  ipAddress?: string | null;
  userId?: number | null;
}

export interface CreateActivityLogDto {
  action: string;
  entityType?: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userId?: number;
}

export interface PaginatedActivityLogsResponse {
  data: ActivityLogDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ActivityLogsQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByUser: Array<{
    userId: number;
    username: string;
    count: number;
  }>;
  recentActions: ActivityLogDto[];
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const activityLogsApi = {
  // Получить все логи активности
  getAll: async (token: string | null, params: ActivityLogsQuery = {}): Promise<PaginatedActivityLogsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.action && { action: params.action }),
      ...(params.entityType && { entityType: params.entityType }),
      ...(params.userId && { userId: params.userId.toString() }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });
    
    const { data } = await axios.get<PaginatedActivityLogsResponse>(`${API_URL}/activity-logs?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить лог по ID
  getById: async (token: string | null, id: number): Promise<ActivityLogDto> => {
    const { data } = await axios.get<ActivityLogDto>(`${API_URL}/activity-logs/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать лог активности
  create: async (data: CreateActivityLogDto): Promise<ActivityLogDto> => {
    const { data: result } = await axios.post<ActivityLogDto>(`${API_URL}/activity-logs`, data);
    return result;
  },

  // Удалить лог активности
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/activity-logs/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Получить статистику активности
  getStats: async (token: string | null, params: { startDate?: string; endDate?: string } = {}): Promise<ActivityStats> => {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });
    
    const { data } = await axios.get<ActivityStats>(`${API_URL}/activity-logs/stats?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Очистить старые логи
  cleanup: async (token: string | null, olderThanDays: number): Promise<{ deletedCount: number }> => {
    const { data } = await axios.delete<{ deletedCount: number }>(`${API_URL}/activity-logs/cleanup`, {
      headers: authHeaders(token),
      params: { olderThanDays }
    });
    return data;
  },

  // Получить типы действий
  getActionTypes: async (): Promise<string[]> => {
    const { data } = await axios.get<string[]>(`${API_URL}/activity-logs/action-types`);
    return data;
  },

  // Получить типы сущностей
  getEntityTypes: async (): Promise<string[]> => {
    const { data } = await axios.get<string[]>(`${API_URL}/activity-logs/entity-types`);
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchActivityLogs = activityLogsApi.getAll;
export const fetchActivityLog = activityLogsApi.getById;
export const createActivityLog = activityLogsApi.create;
export const deleteActivityLog = activityLogsApi.delete;
export const fetchActivityStats = activityLogsApi.getStats;
export const cleanupActivityLogs = activityLogsApi.cleanup;
export const fetchActionTypes = activityLogsApi.getActionTypes;
export const fetchEntityTypes = activityLogsApi.getEntityTypes;
