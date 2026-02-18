import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface PageDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  authorId?: number | null;
}

export interface PaginatedPagesResponse {
  data: PageDto[];
  total: number;
  page: number;
  limit: number;
}

export interface PagesQuery {
  search?: string;
  status?: string;
  authorId?: number;
  page?: number;
  limit?: number;
}

export const fetchPages = async (token: string | null, params: PagesQuery): Promise<PaginatedPagesResponse> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.get<PaginatedPagesResponse>(`${API_URL}/pages`, {
    params,
    headers,
  });
  return data;
};

export const fetchPageBySlug = async (slug: string): Promise<PageDto> => {
  const { data } = await axios.get<PageDto>(`${API_URL}/pages/slug/${slug}`);
  return data;
};


