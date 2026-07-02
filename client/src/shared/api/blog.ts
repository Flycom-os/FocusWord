import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface BlogPostDto {
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
  parentBlogPostId?: number | null;
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

export interface BlogQuery {
  search?: string;
  status?: string;
  authorId?: number;
  page?: number;
  limit?: number;
}

export interface PublicBlogPostSummary {
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

export const fetchBlog = async (
  token: string | null,
  params: BlogQuery,
): Promise<BlogPostDto[]> => {
  const { data } = await axios.get<BlogPostDto[]>(`${API_URL}/blog`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPublicBlog = async (search?: string): Promise<PublicBlogPostSummary[]> => {
  const { data } = await axios.get<PublicBlogPostSummary[]>(`${API_URL}/public/blog`, {
    params: search ? { search } : undefined,
  });
  return data;
};

export const fetchBlogPost = async (token: string | null, id: number): Promise<BlogPostDto> => {
  const { data } = await axios.get<BlogPostDto>(`${API_URL}/blog/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const fetchBlogPostBySlug = async (
  token: string | null,
  slug: string,
): Promise<BlogPostDto> => {
  const { data } = await axios.get<BlogPostDto>(`${API_URL}/blog/slug/${slug}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const fetchPublicBlogPostBySlug = async (slug: string): Promise<BlogPostDto> => {
  const { data } = await axios.get<BlogPostDto>(`${API_URL}/public/blog/slug/${slug}`);
  return data;
};

export const createBlogPost = async (
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
    parentBlogPostId?: number;
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
): Promise<BlogPostDto> => {
  const { data } = await axios.post<BlogPostDto>(`${API_URL}/blog`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const createBlogPostDraft = async (
  token: string | null,
  payload?: {
    title?: string;
    content?: string;
  },
): Promise<BlogPostDto> => {
  const { data } = await axios.post<BlogPostDto>(`${API_URL}/blog/draft`, payload || {}, {
    headers: authHeaders(token),
  });
  return data;
};

export const updateBlogPost = async (
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
    parentBlogPostId: number;
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
): Promise<BlogPostDto> => {
  const { data } = await axios.patch<BlogPostDto>(`${API_URL}/blog/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deleteBlogPost = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/blog/${id}`, {
    headers: authHeaders(token),
  });
};

export const publishBlogPost = async (token: string | null, id: number): Promise<BlogPostDto> => {
  const { data } = await axios.patch<BlogPostDto>(
    `${API_URL}/blog/${id}/publish`,
    {},
    {
      headers: authHeaders(token),
    },
  );
  return data;
};

export const unpublishBlogPost = async (token: string | null, id: number): Promise<BlogPostDto> => {
  const { data } = await axios.patch<BlogPostDto>(
    `${API_URL}/blog/${id}/unpublish`,
    {},
    {
      headers: authHeaders(token),
    },
  );
  return data;
};

export const completeBlogPostWithAi = async (
  token: string | null,
  payload: { prompt: string; content?: string },
): Promise<{ text: string }> => {
  const { data } = await axios.post<{ text: string }>(`${API_URL}/blog/ai/complete`, payload, {
    headers: authHeaders(token),
  });
  return data;
};
