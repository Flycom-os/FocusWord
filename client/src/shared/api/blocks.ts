import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface BlockDto {
  id: number;
  name: string;
  slug: string;
  type: string;
  content: any;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDto {
  name: string;
  slug: string;
  type: string;
  content: any;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBlockDto {
  name?: string;
  slug?: string;
  type?: string;
  content?: any;
  description?: string;
  isActive?: boolean;
}

export interface PaginatedBlocksResponse {
  data: BlockDto[];
  total: number;
  page: number;
  limit: number;
}

export interface BlocksQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
}

export interface BlockTemplate {
  type: string;
  name: string;
  description: string;
  defaultContent: any;
  configSchema?: any;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const blocksApi = {
  // Получить все блоки
  getAll: async (token: string | null, params: BlocksQuery = {}): Promise<PaginatedBlocksResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search }),
      ...(params.type && { type: params.type }),
      ...(params.isActive !== undefined && { isActive: params.isActive.toString() })
    });
    
    const { data } = await axios.get<PaginatedBlocksResponse>(`${API_URL}/blocks?${queryParams}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить блок по ID
  getById: async (token: string | null, id: number): Promise<BlockDto> => {
    const { data } = await axios.get<BlockDto>(`${API_URL}/blocks/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить блок по slug
  getBySlug: async (token: string | null, slug: string): Promise<BlockDto> => {
    const { data } = await axios.get<BlockDto>(`${API_URL}/blocks/slug/${slug}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать блок
  create: async (token: string | null, data: CreateBlockDto): Promise<BlockDto> => {
    const { data: result } = await axios.post<BlockDto>(`${API_URL}/blocks`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить блок
  update: async (token: string | null, id: number, data: UpdateBlockDto): Promise<BlockDto> => {
    const { data: result } = await axios.put<BlockDto>(`${API_URL}/blocks/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить блок
  delete: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/blocks/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Включить/выключить блок
  toggleActive: async (token: string | null, id: number, isActive: boolean): Promise<BlockDto> => {
    const { data } = await axios.patch<BlockDto>(`${API_URL}/blocks/${id}/toggle`, { isActive }, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Клонировать блок
  clone: async (token: string | null, id: number, newName: string): Promise<BlockDto> => {
    const { data } = await axios.post<BlockDto>(`${API_URL}/blocks/${id}/clone`, { name: newName }, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить типы блоков
  getTypes: async (): Promise<BlockTemplate[]> => {
    const { data } = await axios.get<BlockTemplate[]>(`${API_URL}/blocks/types`);
    return data;
  },

  // Получить шаблон блока
  getTemplate: async (type: string): Promise<BlockTemplate> => {
    const { data } = await axios.get<BlockTemplate>(`${API_URL}/blocks/templates/${type}`);
    return data;
  },

  // Валидировать контент блока
  validateContent: async (type: string, content: any): Promise<{ isValid: boolean; errors?: string[] }> => {
    const { data } = await axios.post<{ isValid: boolean; errors?: string[] }>(`${API_URL}/blocks/validate`, { type, content });
    return data;
  },

  // Экспортировать блоки
  export: async (token: string | null, blockIds: number[]): Promise<Blob> => {
    const response = await axios.post(`${API_URL}/blocks/export`, { blockIds }, {
      headers: authHeaders(token),
      responseType: 'blob'
    });
    return response.data;
  },

  // Импортировать блоки
  import: async (token: string | null, file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await axios.post<{ imported: number; errors: string[] }>(`${API_URL}/blocks/import`, formData, {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchBlocks = blocksApi.getAll;
export const fetchBlock = blocksApi.getById;
export const fetchBlockBySlug = blocksApi.getBySlug;
export const createBlock = blocksApi.create;
export const updateBlock = blocksApi.update;
export const deleteBlock = blocksApi.delete;
export const toggleBlockActive = blocksApi.toggleActive;
export const cloneBlock = blocksApi.clone;
export const fetchBlockTypes = blocksApi.getTypes;
export const fetchBlockTemplate = blocksApi.getTemplate;
export const validateBlockContent = blocksApi.validateContent;
export const exportBlocks = blocksApi.export;
export const importBlocks = blocksApi.import;
