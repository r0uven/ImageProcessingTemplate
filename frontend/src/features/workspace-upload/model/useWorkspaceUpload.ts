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

export function useWorkspaceUpload({
  allowedFormats,
  onUploaded,
}: UseWorkspaceUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accept = formatToAccept(allowedFormats);

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
      event.target.value = "";
    }
  }

  return { fileInputRef, accept, handleUpload, handleFileInputChange };
}
