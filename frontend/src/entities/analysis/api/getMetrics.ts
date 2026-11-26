import type { ProcessingMetrics } from "../model/types";
import { client } from "@/shared/api/client";

/** Загружает метрики завершённого запуска анализа по его run_id. */
export async function getProcessingMetrics(
  runId: string,
): Promise<ProcessingMetrics> {
  const { data } = await client.get<ProcessingMetrics>(
    `/analysis/${runId}/metrics`,
  );

  return data;
}
