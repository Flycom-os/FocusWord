import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface ArticleDto {
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
  parentArticleId?: number | null;
  template?: string;
  contentBlocks?: Array<{
    type: string;
    id: number;
    position?: number;
    config?: Record<string, unknown>;
  }>;
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
  enableFeedback?: boolean;
  paymentMethodId?: number | null;
  categories?: any[];
}

export interface ArticlesQuery {
  search?: string;
  status?: string;
  authorId?: number;
  page?: number;
  limit?: number;
}

export interface PublicArticleSummary {
  id: number;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string | null;
  updatedAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

const authHeaders = (token: string | null) => (token ? { Authorization: `Bearer ${token}` } : {});

export const fetchArticles = async (
  token: string | null,
  params: ArticlesQuery,
): Promise<ArticleDto[]> => {
  const { data } = await axios.get<ArticleDto[]>(`${API_URL}/articles`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPublicArticles = async (search?: string): Promise<PublicArticleSummary[]> => {
  const { data } = await axios.get<PublicArticleSummary[]>(`${API_URL}/public/articles`, {
    params: search ? { search } : undefined,
  });
  return data;
};

export const fetchArticle = async (token: string | null, id: number): Promise<ArticleDto> => {
  const { data } = await axios.get<ArticleDto>(`${API_URL}/articles/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const fetchArticleBySlug = async (
  token: string | null,
  slug: string,
): Promise<ArticleDto> => {
  const { data } = await axios.get<ArticleDto>(`${API_URL}/articles/slug/${slug}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPublicArticleBySlug = async (slug: string): Promise<ArticleDto> => {
  const { data } = await axios.get<ArticleDto>(`${API_URL}/public/articles/slug/${slug}`);
  return data;
};

export const createArticle = async (
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
    parentArticleId?: number;
    template?: string;
    categoryIds?: number[];
    enableFeedback?: boolean;
    paymentMethodId?: number | null;
    contentBlocks?: Array<{
      type: string;
      id: number;
      position?: number;
      config?: Record<string, unknown>;
    }>;
  },
): Promise<ArticleDto> => {
  const { data } = await axios.post<ArticleDto>(`${API_URL}/articles`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const createArticleDraft = async (
  token: string | null,
  payload?: {
    title?: string;
    content?: string;
  },
): Promise<ArticleDto> => {
  const { data } = await axios.post<ArticleDto>(`${API_URL}/articles/draft`, payload || {}, {
    headers: authHeaders(token),
  });
  return data;
};

export const updateArticle = async (
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
    parentArticleId: number;
    template: string;
    publishedAt: string;
    categoryIds: number[];
    enableFeedback: boolean;
    paymentMethodId: number | null;
    contentBlocks: Array<{
      type: string;
      id: number;
      position?: number;
      config?: Record<string, unknown>;
    }> | null;
  }>,
): Promise<ArticleDto> => {
  const { data } = await axios.patch<ArticleDto>(`${API_URL}/articles/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deleteArticle = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/articles/${id}`, {
    headers: authHeaders(token),
  });
};

export const publishArticle = async (token: string | null, id: number): Promise<ArticleDto> => {
  const { data } = await axios.patch<ArticleDto>(
    `${API_URL}/articles/${id}/publish`,
    {},
    {
      headers: authHeaders(token),
    },
  );
  return data;
};

export const unpublishArticle = async (token: string | null, id: number): Promise<ArticleDto> => {
  const { data } = await axios.patch<ArticleDto>(
    `${API_URL}/articles/${id}/unpublish`,
    {},
    {
      headers: authHeaders(token),
    },
  );
  return data;
};

export const completeArticleWithAi = async (
  token: string | null,
  payload: { prompt: string; content?: string },
): Promise<{ text: string }> => {
  const { data } = await axios.post<{ text: string }>(`${API_URL}/articles/ai/complete`, payload, {
    headers: authHeaders(token),
  });
  return data;
};
