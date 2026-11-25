// TODO заменить на ответ backend после интеграции обучения моделей
export interface TrainingState {
  id: number;

  original: string;

  mask: string;

  prediction: string;

  accuracy: number;

  iou: number;

  dice: number;
}
