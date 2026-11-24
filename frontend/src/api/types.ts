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
  preprocessed_image: string | null;
  segmentation_mask: string | null;
  postprocessed_mask: string | null;
  detection_overlay: string | null;
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

// Backend schema: GET /analysis/{run_id}/metrics

export type DistributionType =
  | "PORE_SIZE"
  | "AREA"
  | "PERIMETER"
  | "CIRCULARITY"
  | "FORM_FACTOR";

export type DistributionPoint = {
  x: number;
  y: number;
};

export type DistributionStatistics = {
  min: number;
  max: number;
  mean: number;
  median: number;
  standardDeviation: number;
};

export interface ProcessingMetrics {
  filename: string;
  detectedObjects: number;
  distributions: Record<DistributionType, DistributionPoint[]>;
  statistics: Record<DistributionType, DistributionStatistics>;
}

