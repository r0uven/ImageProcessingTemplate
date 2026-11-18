export type SegmentationModel = {
  model_id: string;
  model_name: string;
  model_type: "neural_network" | "classical" | "threshold";
  model_path: string;
  material: string;
  image: string;
  removable: boolean;
  created_at: number;
};
