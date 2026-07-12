export interface DatasetPair {
  id: string;
  original?: File;
  mask?: File;
}

export interface CreateNeuralNetworkForm {
  name: string;
  description: string;

  epochs: number;
  batchSize: number;
  learningRate: number;

  dataset: DatasetPair[];
}
