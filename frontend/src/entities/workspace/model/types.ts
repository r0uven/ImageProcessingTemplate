import type { ProcessingParameters, UploadResponse } from "@/entities/analysis";

/**
 * Параметры обработки без идентификаторов запроса (parametersId, modelId),
 * которые подставляются в момент запуска анализа.
 */
export type ProcessingSettingsState = Omit<
  ProcessingParameters,
  "parametersId" | "modelId"
>;

export type WorkspaceMode = "original" | "processed" | "annotated";

export type WorkspaceViewerState = {
  original: UploadResponse | null;
  processed: UploadResponse | null;
  annotated: UploadResponse | null;
};

export type WorkspaceState = {
  mode: WorkspaceMode;
  viewerState: WorkspaceViewerState;
  processingSettings: ProcessingSettingsState;
  runId: string | null;
  /**
   * Отпечаток изображения и настроек, с которыми был получен `runId`.
   * Позволяет понять, что текущая обработка устарела.
   */
  runFingerprint: string | null;
};
