const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const STORAGE_URL =
  process.env.EXPO_PUBLIC_STORAGE_URL ?? API_URL.replace(/\/api\/?$/, "");

const OLD_LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "172.31.78.185"]);

function joinStorageUrl(path: string) {
  const cleanBase = STORAGE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

export function toImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("data:image")) return url;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.pathname.startsWith("/storage") &&
        OLD_LOCAL_HOSTS.has(parsedUrl.hostname)
      ) {
        return joinStorageUrl(parsedUrl.pathname);
      }
    } catch {
      return url;
    }

    return url;
  }

  return joinStorageUrl(url);
}

export const getImageUrl = toImageUrl;
