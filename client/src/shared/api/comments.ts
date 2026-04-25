import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface CommentDto {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  authorName?: string | null;
  authorEmail?: string | null;
  authorId?: number | null;
  postId?: number | null;
  parentCommentId?: number | null;
}

export interface CreateCommentDto {
  content: string;
  authorName?: string;
  authorEmail?: string;
  authorId?: number;
  postId?: number;
  parentCommentId?: number;
}

export interface UpdateCommentDto {
  content?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PaginatedCommentsResponse {
  data: CommentDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  postId?: number;
  authorId?: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const commentsApi = {
  // Получить все комментарии с пагинацией
  getAll: async (token: string | null, params: CommentsQuery = {}): Promise<PaginatedCommentsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.postId && { postId: params.postId.toString() }),
      ...(params.authorId && { authorId: params.authorId.toString() })
    });
    
    const { data } = await axios.get<PaginatedCommentsResponse>(`${API_URL}/comments?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить комментарий по ID
  getById: async (token: string | null, id: number): Promise<CommentDto> => {
    const { data } = await axios.get<CommentDto>(`${API_URL}/comments/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать новый комментарий
  create: async (data: CreateCommentDto): Promise<CommentDto> => {
    const { data: result } = await axios.post<CommentDto>(`${API_URL}/comments`, data);
    return result;
  },

  // Обновить комментарий
  update: async (token: string | null, id: number, data: UpdateCommentDto): Promise<CommentDto> => {
    const { data: result } = await axios.put<CommentDto>(`${API_URL}/comments/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить комментарий
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/comments/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Изменить статус комментария
  changeStatus: async (token: string | null, id: number, status: 'pending' | 'approved' | 'rejected'): Promise<CommentDto> => {
    const { data } = await axios.patch<CommentDto>(`${API_URL}/comments/${id}/status`, { status }, {
      headers: authHeaders(token),
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchComments = commentsApi.getAll;
export const fetchComment = commentsApi.getById;
export const createComment = commentsApi.create;
export const updateComment = commentsApi.update;
export const deleteComment = commentsApi.delete;
export const changeCommentStatus = commentsApi.changeStatus;
