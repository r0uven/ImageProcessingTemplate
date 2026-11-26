// TODO заменить на ответ backend после интеграции обучения моделей
/** Результат обучения для одного тестового изображения. */
export interface TrainingState {
  id: number;

  original: string;

  mask: string;

  prediction: string;

  accuracy: number;

  iou: number;

  dice: number;
}
