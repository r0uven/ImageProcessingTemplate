import { client } from "../client";

export async function deleteHistoryItem(runId: string): Promise<void> {
  await client.delete(`/history/${runId}`);
}
