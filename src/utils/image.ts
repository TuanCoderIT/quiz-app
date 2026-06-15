const API_URL = process.env.EXPO_PUBLIC_API_URL!;
// ví dụ: http://192.168.1.11:8000/api

const SERVER_URL = API_URL.replace("/api", "");

export function getImageUrl(path?: string | null) {
  if (!path) return null;

  if (path.startsWith("http://localhost:8000")) {
    return path.replace("http://localhost:8000", SERVER_URL);
  }

  if (path.startsWith("http://127.0.0.1:8000")) {
    return path.replace("http://127.0.0.1:8000", SERVER_URL);
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${SERVER_URL}${cleanPath}`;
}
