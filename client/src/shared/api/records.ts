export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  parentCategory?: {
    id: number;
    name: string;
    slug: string;
  };
  childCategories?: {
    id: number;
    name: string;
    slug: string;
  }[];
  posts?: {
    id: number;
    title: string;
    slug: string;
    status: string;
  }[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: number;
}

export interface UpdateCategoryDto extends CreateCategoryDto {
  id: number;
}

export interface PaginatedCategoriesResponse {
  data: CategoryDto[];
  total: number;
  page: number;
  limit: number;
}

export interface RecordDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  contentBlocks?: any[];
  status: 'draft' | 'published';
  template: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  featuredSliderId?: number;
  createdAt: string;
  updatedAt: string;
  categories?: CategoryDto[];
}

export interface CreateRecordDto {
  title: string;
  slug: string;
  content: string;
  contentBlocks?: any[];
  status: 'draft' | 'published';
  template: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  featuredSliderId?: number;
  categoryIds?: number[];
}

export interface UpdateRecordDto extends CreateRecordDto {
  id: number;
}

export interface PaginatedRecordsResponse {
  data: RecordDto[];
  total: number;
  page: number;
  limit: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

const authHeaders = (token: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

// Временно используем pages endpoint для записей

export const recordsApi = {
  // Получить все записи с пагинацией
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedRecordsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await fetch(`${API_URL}/api/records?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    return response.json();
  },

  // Получить запись по ID
  getById: async (id: string): Promise<RecordDto> => {
    const response = await fetch(`${API_URL}/api/records/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch record');
    }
    return response.json();
  },

  // Создать новую запись
  create: async (token: string | null, data: CreateRecordDto): Promise<RecordDto> => {
    const response = await fetch(`${API_URL}/api/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      } as HeadersInit,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create record');
    }
    return response.json();
  },

  // Обновить запись
  update: async (token: string | null, id: string, data: UpdateRecordDto): Promise<RecordDto> => {
    const response = await fetch(`${API_URL}/api/records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      } as HeadersInit,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
    return response.json();
  },

  // Удалить запись
  delete: async (token: string | null, id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/records/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token) as HeadersInit,
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete record');
    }
  },

  // === КАТЕГОРИИИ ЗАПИСЕЙ ===
  // Получить все категории записей
  getCategories: async (page = 1, limit = 10, search = ''): Promise<PaginatedCategoriesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await fetch(`${API_URL}/api/categories?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch record categories');
    }
    return response.json();
  },

  // Создать категорию записи
  createCategory: async (data: CreateCategoryDto): Promise<CategoryDto> => {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create record category');
    }
    return response.json();
  },

  // Обновить категорию записи
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<CategoryDto> => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update record category');
    }
    return response.json();
  },

  // Удалить категорию записи
  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete record category');
    }
  },


  // Изменить статус записи
  changeStatus: async (token: string | null, id: string, status: 'draft' | 'published'): Promise<RecordDto> => {
    const response = await fetch(`${API_URL}/api/records/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      } as HeadersInit,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to change record status');
    }
    return response.json();
  },};


// Экспортируем функции для совместимости со старым кодом
export const fetchRecords = recordsApi.getAll;
export const fetchRecord = recordsApi.getById;
export const createRecord = recordsApi.create;
export const updateRecord = recordsApi.update;
export const deleteRecord = recordsApi.delete;
export const changeStatus = recordsApi.changeStatus;
export const fetchCategories = recordsApi.getCategories;
export const createCategory = recordsApi.createCategory;
export const updateCategory = recordsApi.updateCategory;
export const deleteCategory = recordsApi.deleteCategory;
