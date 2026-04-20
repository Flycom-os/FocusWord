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
  featuredSliderId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
  parentPageId?: number | null;
  template?: string;
  contentBlocks?: Array<{ type: 'slider' | 'media' | 'gallery'; id: number; position?: number; config?: Record<string, any> }>;
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
  featuredSlider?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    slides?: Array<{
      id: number;
      title?: string;
      description?: string;
      linkUrl?: string;
      sortOrder: number;
      image?: {
        id: number;
        filename: string;
        filepath: string;
      } | null;
    }>;
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
  const headers = authHeaders(token);
  console.log('API: Fetching pages with headers:', headers);
  console.log('API: Request URL:', `${API_URL}/pages`);
  console.log('API: Request params:', params);
  
  const { data } = await axios.get<PageDto[]>(`${API_URL}/pages`, {
    params,
    headers,
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
    featuredSliderId?: number;
    seoTitle?: string;
    seoDescription?: string;
    metaKeywords?: string[];
    parentPageId?: number;
    template?: string;
    contentBlocks?: Array<{ type: 'slider' | 'media' | 'gallery'; id: number; position?: number; config?: Record<string, any> }>;
  },
): Promise<PageDto> => {
  const { data } = await axios.post<PageDto>(`${API_URL}/pages`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const createPageDraft = async (
  token: string | null,
  payload?: {
    title?: string;
    content?: string;
  },
): Promise<PageDto> => {
  const { data } = await axios.post<PageDto>(`${API_URL}/pages/draft`, payload || {}, {
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
    featuredSliderId: number | null;
    seoTitle: string;
    seoDescription: string;
    metaKeywords: string[];
    parentPageId: number;
    template: string;
    publishedAt: string;
    contentBlocks: Array<{ type: 'slider' | 'media' | 'gallery'; id: number; position?: number; config?: Record<string, any> }> | null;
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

export const completePageWithAi = async (
  token: string | null,
  payload: { prompt: string; content?: string },
): Promise<{ text: string }> => {
  const { data } = await axios.post<{ text: string }>(`${API_URL}/pages/ai/complete`, payload, {
    headers: authHeaders(token),
  });
  return data;
};


