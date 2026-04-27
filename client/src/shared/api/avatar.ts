import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331';

export interface AvatarUploadResponse {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  fileSize: number;
  altText?: string;
  caption?: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  uploadedById: number;
  createdAt: string;
  updatedAt: string;
}

export const uploadAvatar = async (token: string | null, file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('altText', 'User avatar');
  formData.append('caption', 'Profile avatar image');

  const response = await axios.post<AvatarUploadResponse>(`${API_URL}/mediafiles/upload`, formData, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
