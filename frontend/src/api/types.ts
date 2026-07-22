export interface ImageResponse {
  image_id: string;
  width: number;
  height: number;
}

export interface UploadResponse extends ImageResponse {
  preview_url: string; //base64
}

export interface AnalysisResponse extends ImageResponse {
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

export interface ProcessingParameters {
  modelId?: string;
  threshold?: number;
  minObjectArea?: number;
  usePostprocessing?: boolean;
}
