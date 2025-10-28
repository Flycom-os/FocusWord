import { API } from "./constants";
import { Post, PostsPaginationResponse } from "../types/posts";

// Публичные API методы (без авторизации)
export const getPublicPosts = async (page: number = 1, limit: number = 10): Promise<PostsPaginationResponse> => {
  const response = await fetch(`${API}/api/posts/public-posts/${page}/${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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

export const getPublicPostById = async (id: number): Promise<Post> => {
  const response = await fetch(`${API}/api/posts/public/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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

export const searchPublicPosts = async (query: string, page: number = 1, limit: number = 10): Promise<PostsPaginationResponse> => {
  const response = await fetch(`${API}/api/posts/public-search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = { message: "Ошибка поиска постов" };
    }
    throw { response: { data: json } };
  }

  return await response.json();
};
