const API_URL = "http://127.0.0.1:8000";

export interface AnalysisResponse {
  status: string;
  filename: string;
  mean_area: number;
  detected_objects: number;
  porosity: number;
  preprocessed_image: string;
  segmentation_mask: string;
  postprocessed_mask: string;
  detection_overlay: string;
}

export async function analyzeImage(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Analysis request failed");
  }

  return response.json();
}
