'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/src/app/providers/auth-provider';
import {
  fetchMediaFiles,
  deleteMediaFile,
  uploadMediaFile,
  MediaFileDto,
  MediaFilesQuery,
} from '@/src/shared/api/mediafiles';
import { showToast, Notifications, UiButton } from '@/src/shared/ui';
import { useDebounce } from '@/src/shared/hooks/use-debounce';

const MediaFilesPage = () => {
  const { accessToken } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isImage: false,
    isVideo: false,
    isAudio: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const query = useMemo(() => {
    const q: MediaFilesQuery = { ...pagination };
    if (debouncedSearch) {
      q.search = debouncedSearch;
    }
    if (filters.isImage) {
      q.isImage = true;
    } else if (filters.isVideo) {
      q.isVideo = true;
    } else if (filters.isAudio) {
      q.isAudio = true;
    }
    return q;
  }, [pagination, debouncedSearch, filters]);

  const loadMedia = async () => {
    setIsLoading(true);
    console.log('loadMedia called with query:', query);
    try {
      const res = await fetchMediaFiles(accessToken, query);
      setMediaFiles(res.data);
      // It's a good practice to also update total pages for pagination controls
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load media files';
      console.error('Error loading media files:', error);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered for media files. Current query:', query);
    loadMedia();
  }, [query, accessToken]);

  const handleFilterChange = (name: keyof typeof filters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'isImage' && value) {
        newFilters.isVideo = false;
        newFilters.isAudio = false;
      } else if (name === 'isVideo' && value) {
        newFilters.isImage = false;
        newFilters.isAudio = false;
      } else if (name === 'isAudio' && value) {
        newFilters.isImage = false;
        newFilters.isVideo = false;
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      isImage: false,
      isVideo: false,
      isAudio: false,
    });
  };

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
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search by filename..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="isImage"
            checked={filters.isImage}
            onChange={(e) => handleFilterChange('isImage', e.target.checked)}
          />
          <label htmlFor="isImage">Images only</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="isVideo"
            checked={filters.isVideo}
            onChange={(e) => handleFilterChange('isVideo', e.target.checked)}
          />
          <label htmlFor="isVideo">Videos only</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="isAudio"
            checked={filters.isAudio}
            onChange={(e) => handleFilterChange('isAudio', e.target.checked)}
          />
          <label htmlFor="isAudio">Audio only</label>
        </div>
        <UiButton theme="secondary" onClick={clearFilters}>
          Clear Filters
        </UiButton>
        <UiButton theme="primary">
          <label htmlFor="upload-button">Upload File</label>
        </UiButton>
        <input id="upload-button" type="file" onChange={handleUpload} style={{ display: 'none' }} />
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
