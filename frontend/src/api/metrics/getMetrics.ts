import type { ProcessingMetrics } from "@/pages/VisualizeMetricsPage/types";
import { client } from "../client";

export async function getProcessingMetrics(id: string) {
  const { data } = await client.get<ProcessingMetrics>(
    `/analysis/${id}/metrics`,
  );

  return data;
}
