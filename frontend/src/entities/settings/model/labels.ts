export const SECTION_LABELS: Record<string, string> = {
  image: "Изображения",
  preprocessing: "Предобработка",
  segmentation: "Сегментация",
  postprocessing: "Постобработка",
  object_detection: "Обнаружение объектов",
  object_classification: "Классификация объектов",
  pore_separation: "Разделение пор",
  pore_merging: "Объединение пор",
  feature_extraction: "Вычисление характеристик",
  analysis_pipeline: "Сохранение результатов анализа",
  storage: "Хранение изображений",
  training: "Обучение модели",
};

export const FIELD_LABELS: Record<string, string> = {
  // image
  allowed_formats: "Разрешённые форматы",
  allowed_sizes: "Допустимые размеры",
  default_size: "Размер по умолчанию",
  grayscale: "В оттенках серого",
  pixel_value_range: "Диапазон значений пикселей",
  resize_on_load: "Приводить к размеру при загрузке",

  // preprocessing
  denoise: "Шумоподавление",
  normalize: "Нормализация",
  contrast_enhancement: "Повышение контраста",
  smoothing: "Сглаживание",
  filter_size: "Размер фильтра",
  preserve_size: "Сохранять размер",

  // segmentation
  method: "Метод сегментации",
  output: "Выходная маска",
  output_mask: "Выходная маска",
  threshold: "Пороговая сегментация",
  neural: "Нейросетевая сегментация",
  foreground_value: "Значение объекта",
  background_value: "Значение фона",
  threshold_value: "Порог",
  invert: "Инвертировать",
  selected_model: "Выбранная модель",
  model_id: "Модель",
  entities: "Сущности модели",
  default_confidence_threshold: "Порог уверенности",
  device: "Устройство",

  // postprocessing
  remove_small_objects: "Удалять мелкие объекты",
  min_object_area: "Минимальная площадь объекта",
  fill_holes: "Заполнять пустоты",
  morphology: "Морфология",
  enabled: "Включено",
  operation: "Операция",
  kernel_size: "Размер ядра",

  // object detection / classification
  connectivity: "Связность",
  return_bounding_box: "Возвращать ограничивающий прямоугольник",
  return_centroid: "Возвращать центроид",
  return_object_mask: "Возвращать маску объекта",
  classification_mode: "Режим классификации",
  candidate_rules: "Правила кандидатности",
  max_area: "Максимальная площадь",
  min_roundness: "Минимальная круглость",
  max_eccentricity: "Максимальный эксцентриситет",
  min_solidity: "Минимальная заполненность",
  min_extent: "Минимальная протяжённость",
  features: "Признаки классификации",
  use_area: "Использовать площадь",
  use_roundness: "Использовать круглость",
  use_eccentricity: "Использовать эксцентриситет",
  use_solidity: "Использовать заполненность",
  use_extent: "Использовать протяжённость",

  // pore separation / merging
  apply_only_to_candidates: "Только к кандидатам",
  preserve_autonomous_pores: "Сохранять автономные поры",
  keep_unseparated_candidates: "Сохранять неразделённые кандидаты",
  validate_separation_result: "Проверять результат разделения",
  preserve_parent_link: "Сохранять связь с родителем",
  evaluate_separation_quality: "Оценивать качество разделения",
  quality_metrics: "Показатели качества",
  algorithm_params: "Параметры алгоритма",
  preserve_object_status: "Сохранять статус объекта",
  preserve_parent_object_id: "Сохранять ID родителя",
  preserve_separation_quality_metrics: "Сохранять качество разделения",
  include_autonomous_pores: "Включать автономные поры",
  include_separated_objects: "Включать разделённые объекты",
  include_unseparated_candidates: "Включать неразделённые кандидаты",
  object_statuses: "Допустимые статусы объектов",

  // quality metrics
  covered_area: "Покрытая площадь",
  lost_area: "Потерянная площадь",
  extra_area: "Лишняя площадь",
  coverage_ratio: "Доля покрытия",
  extra_ratio: "Доля лишней площади",

  // feature extraction
  calculate_object_features: "Рассчитывать характеристики объектов",
  calculate_summary_statistics: "Рассчитывать общую статистику",
  include_separation_quality_metrics: "Включать метрики разделения",
  use_status_based_feature_source: "Учитывать источник характеристик",
  use_scale: "Использовать масштаб",
  scale_mm_per_pixel: "Масштаб, мм/пиксель",
  region_object_features: "Характеристики объектов-регионов",
  circle_object_features: "Характеристики объектов-окружностей",
  separation_quality_metrics: "Показатели качества разделения",
  summary_statistics: "Общая статистика",
  area: "Площадь",
  perimeter: "Периметр",
  centroid: "Центроид",
  equivalent_diameter: "Эквивалентный диаметр",
  bounding_box: "Ограничивающий прямоугольник",
  roundness: "Круглость",
  relative_area: "Относительная площадь",
  center: "Центр",
  radius: "Радиус",
  diameter: "Диаметр",
  circumference: "Длина окружности",
  total_count: "Общее количество",
  count_by_status: "Количество по статусам",
  total_pore_area: "Суммарная площадь пор",
  mean_area: "Средняя площадь",
  min_area: "Минимальная площадь",
  porosity: "Пористость",
  size_distribution: "Распределение по размерам",

  // analysis pipeline
  save_intermediate_results: "Сохранять промежуточные результаты",
  save_run_parameters: "Сохранять параметры запуска",
  save_segmentation_mask: "Сохранять маску сегментации",
  save_postprocessed_mask: "Сохранять маску после постобработки",
  save_classification_result: "Сохранять результат классификации",
  save_separation_result: "Сохранять результат разделения",
  save_final_objects: "Сохранять итоговые объекты",
  save_features: "Сохранять характеристики",

  // storage
  images_directory: "Папка для изображений",
  active_storage_id: "Активное хранилище",
  storages: "Список хранилищ",
  cache_max_age_days: "Максимальный возраст кэша, дней",
  cache_max_total_bytes: "Максимальный объём кэша, байт",
  cleanup_interval_minutes: "Интервал очистки, минут",
  cleanup_max_deletions_per_run: "Максимум удалений за проход",

  // training
  dataset_pair_format: "Формат обучающих данных",
  validate_image_mask_size: "Проверять размер изображения и маски",
  allowed_image_formats: "Форматы изображений",
  allowed_mask_formats: "Форматы масок",
  training_params: "Параметры обучения",
  epochs: "Количество эпох",
  batch_size: "Размер батча",
  learning_rate: "Learning Rate",
  architecture: "Архитектура",
  model_registry: "Сохранение модели",
  save_model_file: "Сохранять файл модели",
  register_model_in_config: "Регистрировать модель в конфигурации",
  models_directory: "Папка для моделей",
  metrics: "Показатели качества",
  dice: "Dice",
  iou: "IoU",
  pixel_accuracy: "Точность по пикселям",
};

/**
 * Поля, которые допускают null. Нужны, чтобы редактор понимал, каким
 * контролом показывать пустое значение: числовым или текстовым.
 */
export const NULLABLE_NUMBERS = new Set([
  "max_area",
  "min_roundness",
  "max_eccentricity",
  "min_solidity",
  "min_extent",
  "scale_mm_per_pixel",
  "epochs",
  "batch_size",
  "learning_rate",
]);

export const NULLABLE_STRINGS = new Set(["selected_model", "architecture"]);

/** Поля, которые удобнее редактировать выбором из списка. */
export const SELECT_OPTIONS: Record<string, string[]> = {
  method: ["threshold", "neural"],
  operation: [
    "closing",
    "opening",
    "erosion",
    "dilation",
    "gradient",
    "tophat",
    "blackhat",
  ],
  connectivity: ["4", "8"],
};

/** Человекочитаемое название поля; неизвестные ключи выводятся как есть. */
export function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? key;
}
