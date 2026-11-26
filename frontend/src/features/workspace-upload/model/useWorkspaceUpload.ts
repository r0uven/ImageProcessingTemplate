import { useRef } from "react";
import type { ChangeEvent } from "react";

import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { uploadImage, uploadImageByPath, type UploadResponse } from "@/entities/analysis";
import { formatToAccept } from "@/shared/lib/formatAccept";

type UseWorkspaceUploadOptions = {
  allowedFormats: string[];
  onUploaded: (result: UploadResponse) => void;
};

/**
 * Загрузка изображения в воркспейс: нативный диалог в Tauri,
 * обычный input с файлом в браузере.
 */
export function useWorkspaceUpload({
  allowedFormats,
  onUploaded,
}: UseWorkspaceUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accept = formatToAccept(allowedFormats);

  /** Открывает выбор файла и загружает выбранное изображение. */
  async function handleUpload() {
    // В браузере нативный диалог Tauri недоступен — оставляем обычный выбор файла.
    if (!isTauri()) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Изображения",
            extensions: allowedFormats,
          },
        ],
      });

      if (typeof selected !== "string") return;

      const result = await uploadImageByPath(selected);
      onUploaded(result);
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Проверьте консоль.");
    }
  }

  async function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file);
      onUploaded(result);
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Проверьте консоль.");
    } finally {
      // Сбрасываем input, чтобы можно было выбрать тот же файл повторно.
      event.target.value = "";
    }
  }

  return { fileInputRef, accept, handleUpload, handleFileInputChange };
}
