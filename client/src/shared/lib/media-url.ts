const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export function getMediaUrl(path?: string | null): string {
  if (!path) {
    return "";
  }
  if (path.startsWith("http")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/uploads/") || normalized.startsWith("/backend/uploads/")) {
    return `${API_URL}${normalized.replace("/backend/uploads/", "/uploads/")}`;
  }
  return `${API_URL}/uploads/${path.replace(/^\/+/, "")}`;
}

export function getMediaKind(
  filename?: string | null,
  url?: string | null,
): "image" | "video" | "audio" | "file" {
  const name = (filename || url || "").toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name)) return "image";
  if (/\.(mp4|webm|ogg|avi|mov|mkv)$/i.test(name)) return "video";
  if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(name)) return "audio";
  return "file";
}
