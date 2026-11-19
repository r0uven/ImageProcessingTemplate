import { client } from "../client";
import type { UploadResponse } from "../types";

/**
 * Загружает файл байтами. Используется только как fallback для браузера,
 * где недоступен нативный диалог выбора файла Tauri.
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post<UploadResponse>("/upload", formData);
  return data;
}

/**
 * Передаёт бэкенду путь к файлу на диске. Сам файл по сети не отправляется:
 * сервер копирует его во внутреннее хранилище и дальше работает с копией.
 */
export async function uploadImageByPath(path: string): Promise<UploadResponse> {
  const { data } = await client.post<UploadResponse>("/upload/path", { path });
  return data;
}
