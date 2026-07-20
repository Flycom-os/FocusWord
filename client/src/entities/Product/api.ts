import axios from "axios";
import { Product, ProductFormData, ProductCategory, ProductCategoryFormData } from "./index";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export const productsApi = {
  // Products
  // Accepts optional query params. Backend may return either an array or a paginated object { data, total, page, limit }
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  }): Promise<Product[] | any> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.categoryId) query.set("categoryId", String(params.categoryId));

    const url = `${API_URL}/products${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await axios.get(url);
    // Normalize: if backend returns paginated object, return it as-is; else return array
    if (response.data && response.data.data) {
      return response.data; // paginated
    }
    return response.data; // array
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  getProductReviews: async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}/reviews`);
    return response.data;
  },

  addProductReview: async (
    id: string,
    data: { name: string; email: string; message: string; rating: number },
  ) => {
    const response = await axios.post(`${API_URL}/products/${id}/reviews`, data);
    return response.data;
  },

  createProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await axios.post(`${API_URL}/products`, data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await axios.put(`${API_URL}/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/products/${id}`);
  },

  // Product Categories
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await axios.get(`${API_URL}/product-categories`);
    return response.data;
  },

  getCategory: async (id: string): Promise<ProductCategory> => {
    const response = await axios.get(`${API_URL}/product-categories/${id}`);
    return response.data;
  },

  createCategory: async (data: ProductCategoryFormData): Promise<ProductCategory> => {
    const response = await axios.post(`${API_URL}/product-categories`, data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: Partial<ProductCategoryFormData>,
  ): Promise<ProductCategory> => {
    const response = await axios.put(`${API_URL}/product-categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/product-categories/${id}`);
  },
};
