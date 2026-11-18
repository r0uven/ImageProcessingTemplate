export interface ImageResponse {
  image_id: string;
  width: number;
  height: number;
}

export interface UploadResponse extends ImageResponse {
  preview_url: string;
}

export interface AnalysisResponse extends ImageResponse {
  status: string;
  run_id: string;
  detected_objects: number;
  preprocessed_image: string;
  segmentation_mask: string;
  postprocessed_mask: string;
  detection_overlay: string;
}

// Backend schema: AnalyzeRequest
export interface ProcessingParameters {
  parametersId: string;
  modelId: string;

  preprocessing: {
    denoise: boolean;
    normalize: boolean;
    contrastEnhancement: boolean;
    smoothing: boolean;
    filterSize: number;
    preserveSize: boolean;
  };

  segmentation: {
    method: string;
    outputMask: {
      foregroundValue: number;
      backgroundValue: number;
      preserveSize: boolean;
    };
    threshold: {
      thresholdValue: number;
      invert: boolean;
    };
    neural: {
      modelType: string | null;
      entities: Record<string, unknown>;
      defaultConfidenceThreshold: number;
      device: string;
    };
  };

  separation: {
    enabled: boolean;
    applyOnlyToCandidates: boolean;
    preserveAutonomousPores: boolean;
    keepUnseparatedCandidates: boolean;
    validateSeparationResult: boolean;
    preserveParentLink: boolean;
    evaluateSeparationQuality: boolean;
    qualityMetrics: {
      coveredArea: boolean;
      lostArea: boolean;
      extraArea: boolean;
      coverageRatio: boolean;
      extraRatio: boolean;
    };
    algorithmParams: Record<string, unknown>;
  };
}

