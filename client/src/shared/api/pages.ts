import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface PageDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  authorId?: number | null;
  featuredImageId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
  parentPageId?: number | null;
  template?: string;
  author?: {
    id: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  featuredImage?: {
    id: number;
    filename: string;
    filepath: string;
  } | null;
}

export interface PagesQuery {
  search?: string;
  status?: string;
  authorId?: number;
  page?: number;
  limit?: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const fetchPages = async (token: string | null, params: PagesQuery): Promise<PageDto[]> => {
  const { data } = await axios.get<PageDto[]>(`${API_URL}/pages`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPage = async (token: string | null, id: number): Promise<PageDto> => {
  const { data } = await axios.get<PageDto>(`${API_URL}/pages/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPageBySlug = async (token: string | null, slug: string): Promise<PageDto> => {
  const { data } = await axios.get<PageDto>(`${API_URL}/pages/slug/${slug}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const createPage = async (
  token: string | null,
  payload: {
    title: string;
    slug: string;
    content: string;
    status?: string;
    featuredImageId?: number;
    seoTitle?: string;
    seoDescription?: string;
    metaKeywords?: string[];
    parentPageId?: number;
  },
): Promise<PageDto> => {
  const { data } = await axios.post<PageDto>(`${API_URL}/pages`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const updatePage = async (
  token: string | null,
  id: number,
  payload: Partial<{
    title: string;
    slug: string;
    content: string;
    status: string;
    featuredImageId: number;
    seoTitle: string;
    seoDescription: string;
    metaKeywords: string[];
    parentPageId: number;
    publishedAt: string;
  }>,
): Promise<PageDto> => {
  const { data } = await axios.patch<PageDto>(`${API_URL}/pages/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deletePage = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/pages/${id}`, {
    headers: authHeaders(token),
  });
};

export const publishPage = async (token: string | null, id: number): Promise<PageDto> => {
  const { data } = await axios.patch<PageDto>(`${API_URL}/pages/${id}/publish`, {}, {
    headers: authHeaders(token),
  });
  return data;
};

export const unpublishPage = async (token: string | null, id: number): Promise<PageDto> => {
  const { data } = await axios.patch<PageDto>(`${API_URL}/pages/${id}/unpublish`, {}, {
    headers: authHeaders(token),
  });
  return data;
};


