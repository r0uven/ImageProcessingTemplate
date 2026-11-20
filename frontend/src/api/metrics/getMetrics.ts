import type { ProcessingMetrics } from "../types";
import { client } from "../client";

export async function getProcessingMetrics(
  runId: string,
): Promise<ProcessingMetrics> {
  const { data } = await client.get<ProcessingMetrics>(
    `/analysis/${runId}/metrics`,
  );

  return data;
}
