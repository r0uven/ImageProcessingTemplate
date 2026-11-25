import type { ProcessingMetrics } from "../model/types";
import { client } from "@/shared/api/client";

export async function getProcessingMetrics(
  runId: string,
): Promise<ProcessingMetrics> {
  const { data } = await client.get<ProcessingMetrics>(
    `/analysis/${runId}/metrics`,
  );

  return data;
}
