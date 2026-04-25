import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface ProductDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  categoryId?: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  status: 'active' | 'inactive';
}

export interface UpdateProductCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number;
  status?: 'active' | 'inactive';
}

export interface PaginatedProductCategoriesResponse {
  data: ProductCategoryDto[];
  total: number;
  page: number;
  limit: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const productsApi = {
  // === КАТЕГОРИИ ТОВАРОВ ===
  // Получить все категории товаров
  getCategories: async (token: string | null, page = 1, limit = 10, search = ''): Promise<PaginatedProductCategoriesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const { data } = await axios.get<PaginatedProductCategoriesResponse>(`${API_URL}/product-categories?${params}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить категорию по ID
  getCategory: async (token: string | null, id: number): Promise<ProductCategoryDto> => {
    const { data } = await axios.get<ProductCategoryDto>(`${API_URL}/product-categories/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать категорию товара
  createCategory: async (token: string | null, data: CreateProductCategoryDto): Promise<ProductCategoryDto> => {
    const { data: result } = await axios.post<ProductCategoryDto>(`${API_URL}/product-categories`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить категорию товара
  updateCategory: async (token: string | null, id: number, data: UpdateProductCategoryDto): Promise<ProductCategoryDto> => {
    const { data: result } = await axios.put<ProductCategoryDto>(`${API_URL}/product-categories/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить категорию товара
  deleteCategory: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/product-categories/${id}`, {
      headers: authHeaders(token),
    });
  },
};

// Экспортируем функции для совместимости
export const fetchProductCategories = productsApi.getCategories;
export const fetchProductCategory = productsApi.getCategory;
export const createProductCategory = productsApi.createCategory;
export const updateProductCategory = productsApi.updateCategory;
export const deleteProductCategory = productsApi.deleteCategory;
