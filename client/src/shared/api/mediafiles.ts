import axios from "axios";
import { AuthUser } from "@/src/shared/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface MediaFileDto {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  fileSize: number;
  altText?: string | null;
  caption?: string | null;
  uploadedAt: string;
  updatedAt: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  thumbnailUrl?: string | null;
}

export interface MediaFilesResponse {
  data: MediaFileDto[];
  total: number;
  page: number;
  limit: number;
}

export interface MediaFilesQuery {
  page?: number;
  limit?: number;
  search?: string;
  mimetype?: string;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  uploadedById?: number; // Add this line
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const authHeaders = (token: string | null) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

export const fetchMediaFiles = async (
  token: string | null,
  params: MediaFilesQuery,
): Promise<MediaFilesResponse> => {
  const { data } = await axios.get<MediaFilesResponse>(`${API_URL}/mediafiles`, {
    params,
    headers: authHeaders(token),
  });
  return data;
};

export const deleteMediaFile = async (token: string | null, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/mediafiles/${id}`, {
    headers: authHeaders(token),
  });
};

export const updateMediaFile = async (
  token: string | null,
  id: number,
  payload: Partial<Pick<MediaFileDto, "altText" | "caption">>,
): Promise<MediaFileDto> => {
  const { data } = await axios.patch<MediaFileDto>(`${API_URL}/mediafiles/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
};

export const uploadMediaFile = async (
  token: string | null,
  file: File,
  payload: { altText?: string; caption?: string },
): Promise<MediaFileDto> => {
  const formData = new FormData();
  formData.append("file", file);
  if (payload.altText) formData.append("altText", payload.altText);
  if (payload.caption) formData.append("caption", payload.caption);

  const { data } = await axios.post<MediaFileDto>(`${API_URL}/mediafiles/upload`, formData, {
    headers: {
      ...authHeaders(token),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};


