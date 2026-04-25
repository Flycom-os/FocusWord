import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface PaymentGatewayDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isEnabled: boolean;
  settings?: any;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isEnabled: boolean;
  type: 'card' | 'bank' | 'crypto' | 'other';
  createdAt: string;
  updatedAt: string;
  paymentGatewayId?: number | null;
}

export interface CreatePaymentGatewayDto {
  name: string;
  slug: string;
  description?: string;
  isEnabled?: boolean;
  settings?: any;
  displayOrder?: number;
}

export interface UpdatePaymentGatewayDto {
  name?: string;
  slug?: string;
  description?: string;
  isEnabled?: boolean;
  settings?: any;
  displayOrder?: number;
}

export interface CreatePaymentMethodDto {
  name: string;
  slug: string;
  description?: string;
  isEnabled?: boolean;
  type?: 'card' | 'bank' | 'crypto' | 'other';
  paymentGatewayId?: number;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  slug?: string;
  description?: string;
  isEnabled?: boolean;
  type?: 'card' | 'bank' | 'crypto' | 'other';
  paymentGatewayId?: number;
}

export interface PaginatedPaymentGatewaysResponse {
  data: PaymentGatewayDto[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedPaymentMethodsResponse {
  data: PaymentMethodDto[];
  total: number;
  page: number;
  limit: number;
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const paymentsApi = {
  // === ПЛАТЕЖНЫЕ ШЛЮЗЫ ===
  // Получить все платежные шлюзы
  getGateways: async (token: string | null): Promise<PaymentGatewayDto[]> => {
    const { data } = await axios.get<PaymentGatewayDto[]>(`${API_URL}/payment-gateways`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить шлюз по ID
  getGateway: async (token: string | null, id: number): Promise<PaymentGatewayDto> => {
    const { data } = await axios.get<PaymentGatewayDto>(`${API_URL}/payment-gateways/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать платежный шлюз
  createGateway: async (token: string | null, data: CreatePaymentGatewayDto): Promise<PaymentGatewayDto> => {
    const { data: result } = await axios.post<PaymentGatewayDto>(`${API_URL}/payment-gateways`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить платежный шлюз
  updateGateway: async (token: string | null, id: number, data: UpdatePaymentGatewayDto): Promise<PaymentGatewayDto> => {
    const { data: result } = await axios.put<PaymentGatewayDto>(`${API_URL}/payment-gateways/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить платежный шлюз
  deleteGateway: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/payment-gateways/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Включить/выключить шлюз
  toggleGateway: async (token: string | null, id: number, isEnabled: boolean): Promise<PaymentGatewayDto> => {
    const { data } = await axios.patch<PaymentGatewayDto>(`${API_URL}/payment-gateways/${id}/toggle`, { isEnabled }, {
      headers: authHeaders(token),
    });
    return data;
  },

  // === ПЛАТЕЖНЫЕ МЕТОДЫ ===
  // Получить все платежные методы
  getMethods: async (token: string | null): Promise<PaymentMethodDto[]> => {
    const { data } = await axios.get<PaymentMethodDto[]>(`${API_URL}/payment-methods`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить метод по ID
  getMethod: async (token: string | null, id: number): Promise<PaymentMethodDto> => {
    const { data } = await axios.get<PaymentMethodDto>(`${API_URL}/payment-methods/${id}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Создать платежный метод
  createMethod: async (token: string | null, data: CreatePaymentMethodDto): Promise<PaymentMethodDto> => {
    const { data: result } = await axios.post<PaymentMethodDto>(`${API_URL}/payment-methods`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Обновить платежный метод
  updateMethod: async (token: string | null, id: number, data: UpdatePaymentMethodDto): Promise<PaymentMethodDto> => {
    const { data: result } = await axios.put<PaymentMethodDto>(`${API_URL}/payment-methods/${id}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Удалить платежный метод
  deleteMethod: async (token: string | null, id: number): Promise<void> => {
    await axios.delete(`${API_URL}/payment-methods/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Включить/выключить метод
  toggleMethod: async (token: string | null, id: number, isEnabled: boolean): Promise<PaymentMethodDto> => {
    const { data } = await axios.patch<PaymentMethodDto>(`${API_URL}/payment-methods/${id}/toggle`, { isEnabled }, {
      headers: authHeaders(token),
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchPaymentGateways = paymentsApi.getGateways;
export const fetchPaymentGateway = paymentsApi.getGateway;
export const createPaymentGateway = paymentsApi.createGateway;
export const updatePaymentGateway = paymentsApi.updateGateway;
export const deletePaymentGateway = paymentsApi.deleteGateway;
export const togglePaymentGateway = paymentsApi.toggleGateway;
export const fetchPaymentMethods = paymentsApi.getMethods;
export const fetchPaymentMethod = paymentsApi.getMethod;
export const createPaymentMethod = paymentsApi.createMethod;
export const updatePaymentMethod = paymentsApi.updateMethod;
export const deletePaymentMethod = paymentsApi.deleteMethod;
export const togglePaymentMethod = paymentsApi.toggleMethod;
