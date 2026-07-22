import { client } from "../client";
import type { AnalysisResponse, ProcessingParameters } from "../types";

export async function analyzeImage(
  file: File,
  parameters?: ProcessingParameters,
): Promise<AnalysisResponse> {
  const formData = new FormData();

  formData.append("file", file);

  if (parameters) {
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  }

  const { data } = await client.post<AnalysisResponse>("/analyze", formData);

  return data;
}
