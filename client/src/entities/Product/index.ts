export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: ProductCategory;
  sku: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: ProductCategory[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sku: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
}

export interface ProductCategoryFormData {
  name: string;
  description: string;
  parentId?: string;
}
