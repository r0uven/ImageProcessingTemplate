export interface ProcessingHistoryItem {
  id: string;

  filename: string;

  modelName: string;

  createdAt: string;

  durationMs: number;

  width: number;

  height: number;

  status: "SUCCESS" | "FAILED";

  originalImageUrl: string;

  maskImageUrl: string;
}
