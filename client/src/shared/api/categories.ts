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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export const categoriesApi = {
  // Получить все категории с пагинацией
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedCategoriesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await fetch(`${API_URL}/api/categories?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },

  // Получить категорию по ID
  getById: async (id: string): Promise<CategoryDto> => {
    const response = await fetch(`${API_URL}/api/categories/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    return response.json();
  },

  // Создать новую категорию
  create: async (data: CreateCategoryDto): Promise<CategoryDto> => {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    return response.json();
  },

  // Обновить категорию
  update: async (id: string, data: UpdateCategoryDto): Promise<CategoryDto> => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update category');
    }
    return response.json();
  },

  // Удалить категорию
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
  },
};

// Экспортируем функции для совместимости со старым кодом
export const fetchCategories = categoriesApi.getAll;
export const fetchCategory = categoriesApi.getById;
export const createCategory = categoriesApi.create;
export const updateCategory = categoriesApi.update;
export const deleteCategory = categoriesApi.delete;
