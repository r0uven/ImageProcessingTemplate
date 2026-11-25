import { client } from "../client";

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

export async function getHistory(): Promise<HistoryItemResponse[]> {
  const { data } = await client.get<HistoryItemResponse[]>("/history");
  return data;
}