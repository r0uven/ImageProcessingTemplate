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
