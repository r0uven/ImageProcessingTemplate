import { client } from "@/shared/api/client";
import type { AnalysisResponse, ProcessingParameters } from "../model/types";

/** Запускает анализ загруженного изображения с заданными параметрами. */
export async function analyzeImage(
  imageId: string,
  parameters: ProcessingParameters,
): Promise<AnalysisResponse> {
  const { data } = await client.post<AnalysisResponse>(
    `/analysis/${imageId}`,
    parameters,
  );

  return data;
}
