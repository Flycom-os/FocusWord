import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface PostDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  authorId?: number | null;
  featuredImageId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords: string[];
  contentBlocks?: any[];
}

export interface CreatePostDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published';
  authorId?: number;
  featuredImageId?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  contentBlocks?: any[];
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  authorId?: number;
  featuredImageId?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  contentBlocks?: any[];
}

export interface PaginatedPostsResponse {
  data: PostDto[];
  total: number;
  page: number;
  limit: number;
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published';
  authorId?: number;
  categoryId?: number;
  tagId?: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const postsApi = {
  // Получить все посты с пагинацией
  getAll: async (token: string | null, params: PostsQuery = {}): Promise<PaginatedPostsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.authorId && { authorId: params.authorId.toString() }),
      ...(params.categoryId && { categoryId: params.categoryId.toString() }),
      ...(params.tagId && { tagId: params.tagId.toString() })
    });
    
    const { data } = await axios.get<PaginatedPostsResponse>(`${API_URL}/posts?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить пост по ID
  getById: async (token: string | null, id: number): Promise<PostDto> => {
    const { data } = await axios.get<PostDto>(`${API_URL}/posts/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать новый пост
  create: async (token: string | null, data: CreatePostDto): Promise<PostDto> => {
    const { data: result } = await axios.post<PostDto>(`${API_URL}/posts`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить пост
  update: async (token: string | null, id: number, data: UpdatePostDto): Promise<PostDto> => {
    const { data: result } = await axios.put<PostDto>(`${API_URL}/posts/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить пост
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/posts/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Опубликовать пост
  publish: async (token: string | null, id: number): Promise<PostDto> => {
    const { data } = await axios.patch<PostDto>(`${API_URL}/posts/${id}/publish`, {}, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Снять с публикации пост
  unpublish: async (token: string | null, id: number): Promise<PostDto> => {
    const { data } = await axios.patch<PostDto>(`${API_URL}/posts/${id}/unpublish`, {}, {
      headers: authHeaders(token),
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchPosts = postsApi.getAll;
export const fetchPost = postsApi.getById;
export const createPost = postsApi.create;
export const updatePost = postsApi.update;
export const deletePost = postsApi.delete;
export const publishPost = postsApi.publish;
export const unpublishPost = postsApi.unpublish;
