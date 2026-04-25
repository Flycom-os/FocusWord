import { Product, ProductFormData, ProductCategory, ProductCategoryFormData } from './index';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export const productsApi = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}`);
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

  updateCategory: async (id: string, data: Partial<ProductCategoryFormData>): Promise<ProductCategory> => {
    const response = await axios.put(`${API_URL}/product-categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/product-categories/${id}`);
  },
};
