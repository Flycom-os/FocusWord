import { z } from "zod";
import { API } from "./constants";
import {
  CreatePostRequest,
  UpdatePostRequest,
  Post,
  PostsPaginationResponse,
  MultiplePostsRequest,
  PostsDeletedResponse,
  PostsPublishedResponse,
  SeoData
} from "../types/posts";

// Схемы валидации
const seoDataSchema = z.object({
  seo_title: z.string().min(1, "SEO заголовок обязателен"),
  seo_label: z.string().min(1, "SEO метка обязательна"),
  seo_keywords: z.array(z.string()).min(1, "SEO ключевые слова обязательны"),
  seo_description: z.string().min(1, "SEO описание обязательно"),
});

const createPostSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(64, "Заголовок не должен превышать 64 символа"),
  announcement: z.string().optional(),
  text: z.string().optional(),
  visibility: z.boolean(),
  category_id: z.number().optional(),
  file_id: z.number().optional(),
  seo: seoDataSchema,
  seo_preset_id: z.number().optional(),
  date_to_publish: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

const multiplePostsSchema = z.object({
  ids: z.array(z.number()).min(1, "Необходимо выбрать хотя бы один пост"),
});

// API методы
export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  const parsed = createPostSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка создания поста" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const savePost = async (data: CreatePostRequest): Promise<Post> => {
  const parsed = createPostSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка сохранения поста" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const getPostsPagination = async (currentPage: number, perPage: number): Promise<PostsPaginationResponse> => {
  const response = await fetch(`${API}/api/posts/posts-pagination/${currentPage}/${perPage}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка получения постов" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const getPostById = async (id: number): Promise<Post> => {
  const response = await fetch(`${API}/api/posts/posts/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка получения поста" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const updatePostPublish = async (id: number, data: UpdatePostRequest): Promise<Post> => {
  const parsed = updatePostSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/update-publish/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка обновления поста" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const updatePostSave = async (id: number, data: UpdatePostRequest): Promise<Post> => {
  const parsed = updatePostSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/update-save/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка сохранения поста" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const deletePosts = async (data: MultiplePostsRequest): Promise<PostsDeletedResponse> => {
  const parsed = multiplePostsSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/multiple-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка удаления постов" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};

export const publishPosts = async (data: MultiplePostsRequest): Promise<PostsPublishedResponse> => {
  const parsed = multiplePostsSchema.safeParse(data);
  if (!parsed.success) {
    throw { response: { data: { message: parsed.error.errors.map(e => e.message).join(", ") } } };
  }

  const response = await fetch(`${API}/api/posts/multiple-publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка публикации постов" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};
