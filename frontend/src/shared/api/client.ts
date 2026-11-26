import axios from "axios";

/** Базовый URL backend; переопределяется через VITE_API_URL. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001";

// Общий axios-клиент с длинным таймаутом: анализ изображения может идти долго.
export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600_000,
});

/**
 * Строит полный URL файла, отдаваемого backend (preview_url, previewUrl
 * и подобные пути из ответов API). Для пустого пути возвращает null.
 */
export function buildMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  return `${API_BASE_URL}${path}`;
}
