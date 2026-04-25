export const getMediaUrl = (media: any): string => {
  if (media.url && media.url.startsWith('http')) {
    return media.url;
  }
  if (media.filepath && media.filepath.startsWith('http')) {
    return media.filepath;
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
  const path = media.url || media.filepath;
  return `${API_URL}${path}`;
};

export const isImageFile = (media: any): boolean => {
  return media.isImage || media.mimetype?.startsWith('image/');
};

export const isVideoFile = (media: any): boolean => {
  return media.isVideo || media.mimetype?.startsWith('video/');
};

export const isAudioFile = (media: any): boolean => {
  return media.isAudio || media.mimetype?.startsWith('audio/');
};

export const getFileIcon = (media: any): string => {
  if (isImageFile(media)) return 'image';
  if (isVideoFile(media)) return 'video';
  if (isAudioFile(media)) return 'audio';
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
