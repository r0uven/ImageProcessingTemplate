export interface ImageResponse {
  image_id: string;
  width: number;
  height: number;
}

/** Ответ загрузки: к изображению добавляется ссылка на превью. */
export interface UploadResponse extends ImageResponse {
  preview_url: string;
}

/** Результат анализа: id запуска, найденные объекты и ссылки на артефакты. */
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

export type SettingsSnapshotValue =
  | string
  | number
  | boolean
  | null
  | SettingsSnapshotValue[]
  | { [key: string]: SettingsSnapshotValue };

export type SettingsSnapshotSection = {
  [key: string]: SettingsSnapshotValue;
};

// Backend: снимок настроек, которые повлияли на запуск анализа.
export interface SettingsUsed {
  version: number;
  request: Record<string, SettingsSnapshotSection>;
  global: Record<string, SettingsSnapshotSection> | null;
  complete: boolean;
}

export type AnalysisImageType =
  | "original"
  | "preprocessed"
  | "segmentation"
  | "postprocessed"
  | "overlay";

export interface AnalysisImage {
  type: AnalysisImageType;
  url: string;
}

export type PoreTableRow = {
  index: number;
  objectId: number;
  area: number;
  equivalentRadius: number;
  centerX: number | null;
  centerY: number | null;
};

export type PoreSummary = {
  poreCount: number;
  totalPoreArea: number;
  porosityPercent: number;
  meanPoreArea: number;
  meanEquivalentRadius: number;
  minEquivalentRadius: number;
  maxEquivalentRadius: number;
};

export type MetricUnits = {
  length: string;
  area: string;
  coordinates: string;
};

export interface ProcessingMetrics {
  filename: string;
  detectedObjects: number;
  settingsUsed: SettingsUsed | null;
  images: AnalysisImage[];
  summary: PoreSummary;
  pores: PoreTableRow[];
  units: MetricUnits;
  /** Гистограммы по каждому типу распределения. */
  distributions: Record<DistributionType, DistributionPoint[]>;
  /** Статистика (min/max/mean и т.д.) по каждому распределению. */
  statistics: Record<DistributionType, DistributionStatistics>;
}

