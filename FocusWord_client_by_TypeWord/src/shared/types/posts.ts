/**
 * @types Posts
 */

export interface SeoData {
  seo_title: string;
  seo_label: string;
  seo_keywords: string[];
  seo_description: string;
}

export interface CreatePostRequest {
  title: string;
  announcement?: string;
  text?: string;
  visibility: boolean;
  category_id?: number;
  file_id?: number;
  seo: SeoData;
  seo_preset_id?: number;
  date_to_publish?: string;
}

export interface UpdatePostRequest {
  title?: string;
  announcement?: string;
  text?: string;
  visibility?: boolean;
  category_id?: number;
  file_id?: number;
  seo?: SeoData;
  seo_preset_id?: number;
  date_to_publish?: string;
}

export interface Post {
  id: number;
  title: string;
  announcement: string;
  text: string;
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  visibility: boolean;
  image?: {
    id: number;
    filepath: string;
    miniature?: {
      filepath: string;
    };
  };
  user: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  seo: SeoData;
  draft?: {
    id: number;
    title: string;
    announcement: string;
    text: string;
    status: string;
    visibility: boolean;
    image?: {
      id: number;
      filepath: string;
      miniature?: {
        filepath: string;
      };
    };
    category: {
      id: number;
      name: string;
    };
    user: {
      id: number;
      name: string;
    };
    seo: SeoData;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PostsPaginationResponse {
  current_page: number;
  total_pages: number;
  count: number;
  rows: Array<{
    id: number;
    title: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
    draft: {
      id: number;
    };
  }>;
}

export interface MultiplePostsRequest {
  ids: number[];
}

export interface PostsDeletedResponse {
  message: string;
  deleted_ids: number[];
}

export interface PostsPublishedResponse {
  message: string;
  published_ids: number[];
}
