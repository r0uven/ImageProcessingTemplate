import { client } from "@/shared/api/client";

export interface HistoryItemResponse {
  run_id: string;
  image_id: string;
  filename: string;
  modelName: string;
  createdAt: string;
  duration: number;
  width: number;
  height: number;
  status: "SUCCESS" | "FAILED";
  error: string | null;
  previewUrl: string | null;
}

/** Загружает список завершённых запусков анализа. */
export async function getHistory(): Promise<HistoryItemResponse[]> {
  const { data } = await client.get<HistoryItemResponse[]>("/history");
  return data;
}