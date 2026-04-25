import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface SliderDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SlideDto {
  id: number;
  title?: string | null;
  description?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  sliderId: number;
  imageId?: number | null;
  image?: {
    id: number;
    filename: string;
    filepath: string;
  } | null;
}

export interface PaginatedSlidersResponse {
  data: SliderDto[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedSlidesResponse {
  data: SlideDto[];
  total: number;
  page: number;
  limit: number;
}

export interface SliderDetailsDto extends SliderDto {
  slides: SlideDto[];
}

export interface SliderQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const authHeaders = (token: string | null) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

export const fetchSliders = async (token: string | null, params: SliderQuery): Promise<PaginatedSlidersResponse> => {
  const { data } = await axios.get<PaginatedSlidersResponse>(`${API_URL}/sliders`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const createSlider = async (
  token: string | null,
  payload: { name: string; slug: string; description?: string },
): Promise<SliderDto> => {
  const { data } = await axios.post<SliderDto>(`${API_URL}/sliders`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deleteSlider = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/sliders/${id}`, {
    headers: authHeaders(token),
  });
};

export const fetchSlides = async (
  token: string | null,
  sliderId: number,
  params: SliderQuery,
): Promise<PaginatedSlidesResponse> => {
  const { data } = await axios.get<PaginatedSlidesResponse>(`${API_URL}/sliders/${sliderId}/slides`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const createSlide = async (
  token: string | null,
  sliderId: number,
  payload: { title?: string; description?: string; linkUrl?: string; sortOrder?: number; imageId?: number },
): Promise<SlideDto> => {
  const { data } = await axios.post<SlideDto>(`${API_URL}/sliders/${sliderId}/slides`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const deleteSlide = async (token: string | null, sliderId: number, slideId: number): Promise<void> => {
  await axios.delete(`${API_URL}/sliders/${sliderId}/slides/${slideId}`, {
    headers: authHeaders(token),
  });
};

export const updateSlider = async (
  token: string | null,
  id: number,
  payload: Partial<{ name: string; slug: string; description?: string }>,
): Promise<SliderDto> => {
  const { data } = await axios.patch<SliderDto>(`${API_URL}/sliders/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const getSlider = async (token: string | null, id: number): Promise<SliderDetailsDto> => {
  const { data } = await axios.get<SliderDetailsDto>(`${API_URL}/sliders/${id}`, {
    headers: authHeaders(token),
  });
  return data;
};

export const updateSlide = async (
  token: string | null,
  sliderId: number,
  slideId: number,
  payload: Partial<{ title?: string; description?: string; linkUrl?: string; sortOrder?: number; imageId?: number }>,
): Promise<SlideDto> => {
  const { data } = await axios.patch<SlideDto>(`${API_URL}/sliders/${sliderId}/slides/${slideId}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const getSlide = async (token: string | null, sliderId: number, slideId: number): Promise<SlideDto> => {
  const { data } = await axios.get<SlideDto>(`${API_URL}/sliders/${sliderId}/slides/${slideId}`, {
    headers: authHeaders(token),
  });
  return data;
};


