export interface ImageSettings {
  allowed_formats: string[];
  allowed_sizes: [number, number][];
  default_size: [number, number];
  grayscale: boolean;
  pixel_value_range: [number, number];
  resize_on_load: boolean;
}

export interface PreprocessingSettings {
  denoise: boolean;
  normalize: boolean;
  contrast_enhancement: boolean;
  smoothing: boolean;
  filter_size: number;
  preserve_size: boolean;
}

export interface OutputMaskSettings {
  foreground_value: number;
  background_value: number;
  preserve_size: boolean;
}

export interface ThresholdSegmentationSettings {
  threshold_value: number;
  invert: boolean;
}

export interface NeuralSegmentationSettings {
  selected_model: string | null;
  entities: Record<string, unknown>;
  default_confidence_threshold: number;
  device: string;
}

export interface SegmentationSettings {
  method: "threshold" | "neural";
  output: OutputMaskSettings;
  threshold: ThresholdSegmentationSettings;
  neural: NeuralSegmentationSettings;
}

export interface MorphologySettings {
  enabled: boolean;
  operation: string;
  kernel_size: number;
}

export interface PostprocessingSettings {
  remove_small_objects: boolean;
  min_object_area: number;
  fill_holes: boolean;
  morphology: MorphologySettings;
  preserve_size: boolean;
}

export interface ObjectDetectionSettings {
  connectivity: number;
  min_object_area: number;
  return_bounding_box: boolean;
  return_centroid: boolean;
  return_object_mask: boolean;
}

export interface CandidateRulesSettings {
  max_area: number | null;
  min_roundness: number | null;
  max_eccentricity: number | null;
  min_solidity: number | null;
  min_extent: number | null;
}

export interface ClassificationFeaturesSettings {
  use_area: boolean;
  use_roundness: boolean;
  use_eccentricity: boolean;
  use_solidity: boolean;
  use_extent: boolean;
}

export interface ObjectClassificationSettings {
  classification_mode: string;
  candidate_rules: CandidateRulesSettings;
  features: ClassificationFeaturesSettings;
}

export interface QualityMetricsSettings {
  covered_area: boolean;
  lost_area: boolean;
  extra_area: boolean;
  coverage_ratio: boolean;
  extra_ratio: boolean;
}

export interface PoreSeparationSettings {
  enabled: boolean;
  apply_only_to_candidates: boolean;
  preserve_autonomous_pores: boolean;
  keep_unseparated_candidates: boolean;
  validate_separation_result: boolean;
  preserve_parent_link: boolean;
  evaluate_separation_quality: boolean;
  quality_metrics: QualityMetricsSettings;
  algorithm_params: Record<string, unknown>;
}

export interface PoreMergingSettings {
  preserve_object_status: boolean;
  preserve_parent_object_id: boolean;
  preserve_separation_quality_metrics: boolean;
  include_autonomous_pores: boolean;
  include_separated_objects: boolean;
  include_unseparated_candidates: boolean;
  object_statuses: string[];
}

export interface RegionObjectFeaturesSettings {
  area: boolean;
  perimeter: boolean;
  centroid: boolean;
  equivalent_diameter: boolean;
  bounding_box: boolean;
  roundness: boolean;
  relative_area: boolean;
}

export interface CircleObjectFeaturesSettings {
  center: boolean;
  radius: boolean;
  diameter: boolean;
  area: boolean;
  circumference: boolean;
  relative_area: boolean;
}

export interface SummaryStatisticsSettings {
  total_count: boolean;
  count_by_status: boolean;
  total_pore_area: boolean;
  mean_area: boolean;
  min_area: boolean;
  max_area: boolean;
  porosity: boolean;
  size_distribution: boolean;
}

export interface FeatureExtractionSettings {
  calculate_object_features: boolean;
  calculate_summary_statistics: boolean;
  preserve_object_status: boolean;
  preserve_parent_object_id: boolean;
  include_separation_quality_metrics: boolean;
  use_status_based_feature_source: boolean;
  use_scale: boolean;
  scale_mm_per_pixel: number | null;
  region_object_features: RegionObjectFeaturesSettings;
  circle_object_features: CircleObjectFeaturesSettings;
  separation_quality_metrics: QualityMetricsSettings;
  summary_statistics: SummaryStatisticsSettings;
}

export interface AnalysisPipelineSettings {
  save_intermediate_results: boolean;
  save_run_parameters: boolean;
  save_segmentation_mask: boolean;
  save_postprocessed_mask: boolean;
  save_classification_result: boolean;
  save_separation_result: boolean;
  save_final_objects: boolean;
  save_features: boolean;
}

export interface StorageEntry {
  id: string;
  path: string;
  label: string;
  created_at: string | null;
  last_used_at: string | null;
}

export interface StorageStatus extends StorageEntry {
  resolved_path: string;
  exists: boolean;
  is_active?: boolean;
}

export interface StorageInfo extends StorageStatus {
  is_active: boolean;
  image_count: number;
  file_count: number;
  size_bytes: number;
}

export interface StorageSettings {
  active_storage_id: string;
  storages: StorageEntry[];
  cache_max_age_days: number;
  cache_max_total_bytes: number;
  cleanup_interval_minutes: number;
  cleanup_max_deletions_per_run: number;
}

export interface TrainingParamsSettings {
  epochs: number | null;
  batch_size: number | null;
  learning_rate: number | null;
  architecture: string | null;
}

export interface ModelRegistrySettings {
  save_model_file: boolean;
  register_model_in_config: boolean;
  models_directory: string;
}

export interface TrainingMetricsSettings {
  dice: boolean;
  iou: boolean;
  pixel_accuracy: boolean;
}

export interface TrainingSettings {
  dataset_pair_format: string;
  validate_image_mask_size: boolean;
  allowed_image_formats: string[];
  allowed_mask_formats: string[];
  training_params: TrainingParamsSettings;
  model_registry: ModelRegistrySettings;
  metrics: TrainingMetricsSettings;
}

export interface AppSettings {
  image: ImageSettings;
  preprocessing: PreprocessingSettings;
  segmentation: SegmentationSettings;
  postprocessing: PostprocessingSettings;
  object_detection: ObjectDetectionSettings;
  object_classification: ObjectClassificationSettings;
  pore_separation: PoreSeparationSettings;
  pore_merging: PoreMergingSettings;
  feature_extraction: FeatureExtractionSettings;
  analysis_pipeline: AnalysisPipelineSettings;
  storage: StorageSettings;
  training: TrainingSettings;
}

export interface SettingsEnvelope {
  settings: AppSettings;
  config_path: string;
  images_directory: string;
  resolved_images_directory: string;
  active_storage_id: string;
  storages: StorageStatus[];
  updated_at: string;
}
