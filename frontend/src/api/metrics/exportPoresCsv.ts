import { invoke, isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

import { client } from "../client";

type SaveCsvResult = "saved" | "canceled";

type FileSystemWritableStream = {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
};

type SaveFileHandle = {
  createWritable: () => Promise<FileSystemWritableStream>;
};

type SaveFilePicker = (options: {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<SaveFileHandle>;

function filenameFromDisposition(disposition: unknown, fallback: string): string {
  if (typeof disposition !== "string") return fallback;

  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1] ?? fallback;
}

function isCanceled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

function downloadInBrowser(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Сохраняет CSV через системный диалог выбора файла.
 *
 * В Tauri используется нативный диалог плагина dialog и команда записи,
 * в браузере — File System Access API (если доступен). Для браузеров без
 * этого API остаётся обычное скачивание файла.
 */
export async function savePoresCsv(runId: string): Promise<SaveCsvResult> {
  const response = await client.get<string>(`/analysis/${runId}/export/csv`, {
    responseType: "text",
  });

  const filename = filenameFromDisposition(
    response.headers["content-disposition"],
    `pores_${runId}.csv`,
  );

  // Браузер может убрать BOM при декодировании ответа, поэтому добавляем его
  // сами: так Excel корректно откроет кириллицу.
  const csv = response.data.startsWith("\ufeff")
    ? response.data
    : `\ufeff${response.data}`;

  if (isTauri()) {
    const selectedPath = await save({
      title: "Сохранить таблицу пор",
      defaultPath: filename,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (!selectedPath) return "canceled";

    const path = selectedPath.toLowerCase().endsWith(".csv")
      ? selectedPath
      : `${selectedPath}.csv`;

    await invoke("save_text_file", { path, contents: csv });
    return "saved";
  }

  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker })
    .showSaveFilePicker;

  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [
          {
            description: "CSV",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await handle.createWritable();

      await writable.write(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      await writable.close();
      return "saved";
    } catch (error) {
      if (isCanceled(error)) return "canceled";

      // Некоторые браузеры показывают API, но запрещают вызов вне
      // защищённого контекста. В таком случае используем обычное скачивание.
      downloadInBrowser(csv, filename);
      return "saved";
    }
  }

  downloadInBrowser(csv, filename);
  return "saved";
}
