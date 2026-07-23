import { client } from "../client";
import type { AnalysisResponse, ProcessingParameters } from "../types";

export async function analyzeImage(
  imageId: string,
  parameters: ProcessingParameters,
): Promise<AnalysisResponse> {
  const { data } = await client.post<AnalysisResponse>(
    `/analyze/${imageId}`,
    parameters,
  );

  return data;
}
