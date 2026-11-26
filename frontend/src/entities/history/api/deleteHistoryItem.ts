import { client } from "@/shared/api/client";

/** Удаляет запись о запуске анализа из истории. */
export async function deleteHistoryItem(runId: string): Promise<void> {
  await client.delete(`/history/${runId}`);
}
