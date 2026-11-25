import { client } from "@/shared/api/client";

export async function deleteHistoryItem(runId: string): Promise<void> {
  await client.delete(`/history/${runId}`);
}
