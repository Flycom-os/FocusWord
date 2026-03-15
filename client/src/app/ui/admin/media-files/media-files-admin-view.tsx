'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/app/providers/auth-provider';
import {
  fetchMediaFiles,
  deleteMediaFile,
  uploadMediaFile,
  MediaFileDto,
  MediaFilesQuery,
} from '@/src/shared/api/mediafiles';
import { showToast, Notifications, UiButton } from '@/src/shared/ui';

const MediaFilesPage = () => {
  const { accessToken } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState<MediaFilesQuery>({ page: 1, limit: 20 });

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMediaFiles(accessToken, query);
      setMediaFiles(res.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load media files';
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [accessToken, query]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteMediaFile(accessToken, id);
      showToast({ type: 'success', message: 'File deleted successfully' });
      loadMedia(); // Refresh list
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete file';
      showToast({ type: 'error', message });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadMediaFile(accessToken, file, {});
      showToast({ type: 'success', message: 'File uploaded successfully' });
      loadMedia(); // Refresh list
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to upload file';
      showToast({ type: 'error', message });
    }
  };
  
  const getFileUrl = (item: MediaFileDto) => {
    if (item.filepath && item.filepath.startsWith('http')) {
      return item.filepath;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
    return `${API_URL}${item.filepath}`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Notifications />
      <h1>Media Files</h1>
      <div style={{ marginBottom: '16px' }}>
        <UiButton theme="primary" >
            <label htmlFor="upload-button">Upload File</label>
        </UiButton>
        <input
          id="upload-button"
          type="file"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {mediaFiles.map((file) => (
            <div key={file.id} style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
              {file.isImage ? (
                <img src={getFileUrl(file)} alt={file.altText || ''} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
              ) : (
                <div style={{ padding: '16px', textAlign: 'center' }}>{file.mimetype}</div>
              )}
              <p style={{ wordBreak: 'break-all', fontSize: '14px' }}>{file.filename}</p>
              <UiButton theme="warning" onClick={() => handleDelete(file.id)}>
                Delete
              </UiButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaFilesPage;
