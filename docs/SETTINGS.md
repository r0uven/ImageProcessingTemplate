# Настройки приложения

Все глобальные настройки хранятся в `backend/app/config/settings.json` и описаны Pydantic-схемой `backend/app/schemas/settings_schema.py`. Изменять их можно:

- через страницу **«Настройки»** в приложении (`/settings`);
- через `PUT /settings` (полный объект настроек);
- вручную в `settings.json` (при следующем чтении/перезапуске, а для части полей — только после перезапуска, так как многие модули читают `APP_SETTINGS` при каждом вызове, но некоторые значения кэшируются при старте).

## Жизненный цикл

1. При импорте `app.config.config_loader` вызывается `ensure_settings_file()`.
2. Если `settings.json` нет — он создаётся из `default_settings()`.
3. Если JSON битый или это не объект — файл переименовывается в `settings.json.broken-<timestamp>`, создаются дефолты.
4. Загруженные значения рекурсивно дополняются недостающими полями из дефолтов (`_merge_settings`).
5. Старый формат `storage.images_directory` мигрирует в реестр `storage.storages`; при изменении файл перезаписывается.
6. Результат доступен как `APP_SETTINGS` — изменяемый словарь, на который ссылаются модули.
7. `PUT /settings` валидирует объект, атомарно пишет файл, затем `APP_SETTINGS.clear()` + `update()` — все модули сразу видят новые значения.
8. `ImageStorage.apply_settings()` переключает активное хранилище и пересоздаёт пути/лимиты кэша.

Запись атомарная: временный файл в той же папке → `flush` + `fsync` → `os.replace`.

> `settings.json` может отличаться от `default_settings.py`. Дефолты — эталон для восстановления и для новых полей; рабочая копия — то, что реально применяется.

---

## Секции

### `image` — параметры загрузки изображений

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `allowed_formats` | string[] | `["png","bmp","tif","tiff"]` | Разрешённые расширения при загрузке (`ImageLoader`, `ImageStorage`). Нормализуются в нижний регистр без точки. |
| `allowed_sizes` | [int,int][] | `[[512,512],[1024,1024],[2048,2048]]` | **Только валидация:** если `resize_on_load=true`, `default_size` обязан входить в список. На загрузку не влияет. |
| `default_size` | [int,int] | `[1024,1024]` | Целевой размер при `resize_on_load=true`. |
| `grayscale` | bool | `false` | Переводит изображение в оттенки серого, но оставляет 3 канала BGR (пайплайн ожидает BGR). |
| `pixel_value_range` | [int,int] | `[0,255]` | Диапазон для min-max нормализации в предобработке. |
| `resize_on_load` | bool | `false` | Приводить изображение к `default_size` при загрузке. |

Применяется в `app/utils/image_processing.py::apply_image_settings`.

### `preprocessing` — значения по умолчанию для предобработки

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `denoise` | bool | `true` | Шумоподавление |
| `normalize` | bool | `true` | Min-max нормализация |
| `contrast_enhancement` | bool | `false` | CLAHE / эквализация |
| `smoothing` | bool | `false` | Gaussian blur |
| `filter_size` | int ≥ 1 | `3` | Размер ядра; чётные значения увеличиваются на 1 |
| `preserve_size` | bool | `true` | Вернуть исходный размер |

> В анализе используются значения из **запроса** (`AnalyzeRequest.preprocessing`). Секция задаёт стартовые значения для UI (`workspaceStore.createDefaultSettings`). Backend fallback `default_preprocessing_parameters()` срабатывает только если параметры не переданы (в API это не происходит).

### `segmentation` — параметры сегментации

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `method` | `"threshold"` \| `"neural"` | `"threshold"` | Метод; `"neural"` пока приводит к ошибке |
| `output.foreground_value` | int 0…255 | `1` | Значение пикселей объекта в сохраняемых масках |
| `output.background_value` | int 0…255 | `0` | Значение пикселей фона |
| `output.preserve_size` | bool | `true` | Сохранять размер маски |
| `threshold.threshold_value` | int 0…255 | `128` | Порог |
| `threshold.invert` | bool | `false` | Инверсия threshold |
| `neural.selected_model` | string \| null | `null` | Выбранная нейромодель |
| `neural.entities` | object | `{}` | Параметры сущностей |
| `neural.default_confidence_threshold` | float 0…1 | `0.5` | Порог уверенности |
| `neural.device` | string | `"cpu"` | Устройство инференса |

> Как и `preprocessing`, это **значения по умолчанию для UI**. В анализе используются поля запроса. Сохранение маски берёт `foreground_value`/`background_value` из запроса.

### `postprocessing` — очистка маски

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `remove_small_objects` | bool | `true` | Удалять мелкие области |
| `min_object_area` | int ≥ 0 | `20` | Порог площади; удаляются объекты строго меньше |
| `fill_holes` | bool | `true` | Заполнять дыры внутри пор |
| `morphology.enabled` | bool | `true` | Включить морфологию |
| `morphology.operation` | enum | `"closing"` | `closing`, `opening`, `erosion`, `dilation`, `gradient`, `tophat`, `blackhat` |
| `morphology.kernel_size` | int ≥ 1 | `3` | Размер ядра |
| `preserve_size` | bool | `true` | Вернуть исходный размер |

Используется напрямую из `APP_SETTINGS` в `Postprocessor`, поэтому изменения применяются к следующему запуску без перезапуска.

### `object_detection` — поиск объектов

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `connectivity` | `4` \| `8` | `8` | Связность; для skimage преобразуется в 1/2 |
| `min_object_area` | int ≥ 0 | `20` | Минимальная площадь объекта |
| `return_bounding_box` | bool | `true` | Считать bounding box (нужен для оверлея) |
| `return_centroid` | bool | `true` | Считать центроид |
| `return_object_mask` | bool | `false` | Сохранять маску каждого объекта |

Используется в `MockDetector`. Если `return_bounding_box=false`, оверлей не нарисует рамки; если `return_centroid=false`, в таблице пор не будет координат.

### `object_classification` — классификация объектов

| Поле | По умолчанию | Статус |
|---|---|---|
| `classification_mode` | `"detect_separation_candidates"` | **Не используется** |
| `candidate_rules.max_area` | `null` | **Не используется** |
| `candidate_rules.min_roundness` | `null` | **Не используется** |
| `candidate_rules.max_eccentricity` | `null` | **Не используется** |
| `candidate_rules.min_solidity` | `null` | **Не используется** |
| `candidate_rules.min_extent` | `null` | **Не используется** |
| `features.use_*` | `true` | **Не используется** |

Предназначено для будущего модуля классификации: разделение объектов на `autonomous` и `candidate` (кандидаты на разделение). См. [TODO.md](TODO.md#4-классификация-объектов-p0p1).

### `pore_separation` — разделение слипшихся пор

| Поле | По умолчанию | Статус |
|---|---|---|
| `enabled` | `true` | **Не используется пайплайном** |
| `apply_only_to_candidates` | `true` | **Не используется** |
| `preserve_autonomous_pores` | `true` | **Не используется** |
| `keep_unseparated_candidates` | `true` | **Не используется** |
| `validate_separation_result` | `true` | **Не используется** |
| `preserve_parent_link` | `true` | **Не используется** |
| `evaluate_separation_quality` | `true` | **Не используется** |
| `quality_metrics.*` | `true`/`false` | **Не используется** |
| `algorithm_params` | `{}` | **Не используется** |

Значения участвуют в снимке параметров и передаются в `SeparationParameters`, но шага разделения в пайплайне нет.

### `pore_merging` — объединение пор

Все поля (**не используются**):

- `preserve_object_status`
- `preserve_parent_object_id`
- `preserve_separation_quality_metrics`
- `include_autonomous_pores`
- `include_separated_objects`
- `include_unseparated_candidates`
- `object_statuses` (`["autonomous","separated","unseparated_candidate"]`)

### `feature_extraction` — расчёт характеристик

| Поле | По умолчанию | Статус |
|---|---|---|
| `use_scale` | `false` | **Используется**: пересчёт px → мм |
| `scale_mm_per_pixel` | `null` | **Используется** при `use_scale=true`; обязателен и > 0 |
| `calculate_object_features` | `true` | **Не используется** |
| `calculate_summary_statistics` | `true` | **Не используется** |
| `preserve_object_status` | `true` | **Не используется** |
| `preserve_parent_object_id` | `true` | **Не используется** |
| `include_separation_quality_metrics` | `true` | **Не используется** |
| `use_status_based_feature_source` | `true` | **Не используется** |
| `region_object_features.*` | `true` | **Не используется** |
| `circle_object_features.*` | `true` | **Не используется** |
| `separation_quality_metrics.*` | — | **Не используется** |
| `summary_statistics.*` | `true` | **Не используется** |

`FeatureExtractor` всегда считает базовый набор (площадь, диаметр, пористость, таблицу пор). Флаги выше зарезервированы под расширенную статистику.

Если `use_scale=true`, backend пересчитывает:
- площадь: `area_px * scale²`;
- диаметр/радиус: `diameter_px * scale`;
- площадь изображения: `width * height * scale²`.

В метриках появляются единицы `мм` и `мм²`.

> Валидация: `use_scale=true` без `scale_mm_per_pixel` отклоняется с `422`.

### `analysis_pipeline` — сохранение результатов

| Поле | По умолчанию | Влияние |
|---|---|---|
| `save_intermediate_results` | `true` | Сохранять `preprocessed` |
| `save_run_parameters` | `true` | Писать JSON-снимок параметров в `analysis_runs.settings_snapshot` |
| `save_segmentation_mask` | `true` | Сохранять `segmentation` |
| `save_postprocessed_mask` | `true` | Сохранять `postprocessed` |
| `save_classification_result` | `true` | **Не используется** |
| `save_separation_result` | `true` | **Не используется** |
| `save_final_objects` | `true` | Сохранять `overlay` |
| `save_features` | `true` | **Не используется** |

Влияет на ответ анализа (ссылки могут быть `null`), историю (выбор `previewUrl`) и набор файлов в `analysis/<run_id>/`.

### `storage` — реестр хранилищ и кэш

| Поле | Тип | По умолчанию | Влияние |
|---|---|---|---|
| `active_storage_id` | string | `"default"` | Куда пишутся новые файлы |
| `storages` | `StorageEntry[]` | одно хранилище | Все зарегистрированные папки |
| `cache_max_age_days` | int ≥ 0 | `183` | Максимальный возраст превью |
| `cache_max_total_bytes` | int ≥ 0 | `10737418240` (10 ГиБ) | Лимит суммарного размера превью |
| `cleanup_interval_minutes` | int ≥ 1 | `30` | Период фоновой очистки |
| `cleanup_max_deletions_per_run` | int ≥ 0 | `25` | Сколько файлов удалять за один проход |

`StorageEntry`:

| Поле | Описание |
|---|---|
| `id` | `[A-Za-z0-9_-]{1,64}` |
| `path` | Абсолютный или относительный (от `backend/`) путь |
| `label` | Отображаемое имя |
| `created_at` | ISO-время добавления |
| `last_used_at` | ISO-время активации |

Правила:

- минимум одно хранилище;
- `id` уникальны;
- `active_storage_id` обязан присутствовать в списке;
- пути не могут совпадать;
- хранилища не могут быть вложены друг в друга;
- активная папка создаётся автоматически при сохранении;
- архивные хранилища доступны только для чтения;
- при старте `reconcile_storages()` добавляет в реестр папки, на которые ещё ссылается БД.

Кэшируются только **превью**. Оригиналы не удаляются автоматически, потому что на них ссылается БД.

### `training` — обучение моделей

| Поле | По умолчанию | Статус |
|---|---|---|
| `dataset_pair_format` | `"image_mask"` | **Не используется backend** |
| `validate_image_mask_size` | `true` | Используется **frontend** при проверке маски |
| `allowed_image_formats` | `[".png",".bmp",".tif",".tiff"]` | Используется frontend |
| `allowed_mask_formats` | `[".png",".bmp",".tif",".tiff"]` | Используется frontend |
| `training_params.epochs` | `100` | Используется mock-страницами |
| `training_params.batch_size` | `8` | Используется mock-страницами |
| `training_params.learning_rate` | `0.001` | Используется mock-страницами |
| `training_params.architecture` | `null` | Не используется |
| `model_registry.save_model_file` | `true` | Не используется |
| `model_registry.register_model_in_config` | `true` | Не используется |
| `model_registry.models_directory` | `"entities"` | Не используется |
| `metrics.dice` | `true` | Используется mock-страницей результата |
| `metrics.iou` | `true` | Используется mock-страницей результата |
| `metrics.pixel_accuracy` | `true` | Используется mock-страницей результата |

Backend-кода обучения, регистрации модели и записи в `segmentation_models` нет. Это одна из главных незавершённых частей проекта.

---

## Валидация

Схема `AppSettings` использует `extra="forbid"`: любое неизвестное поле — ошибка `422`. Основные ограничения:

- `image.allowed_formats` — минимум один формат, значения нормализуются (`PNG` → `png`, `.png` → `png`), дубликаты удаляются.
- `image.allowed_sizes`/`default_size` — положительные размеры.
- `image.pixel_value_range` — `0 ≤ low ≤ high ≤ 255`.
- `preprocessing.filter_size` — `≥ 1`.
- `segmentation.output.*_value` — `0…255`.
- `segmentation.threshold.threshold_value` — `0…255`.
- `segmentation.neural.default_confidence_threshold` — `0…1`.
- `postprocessing.min_object_area` — `≥ 0`; `morphology.kernel_size` — `≥ 1`.
- `object_detection.connectivity` — только `4` или `8`.
- `feature_extraction.scale_mm_per_pixel` — `> 0`, если задан; обязателен при `use_scale=true`.
- `storage.*` — см. правила выше.
- `training.allowed_*_formats` — нормализуются с точкой (`.png`), минимум один.

Дополнительно `settings_service._validate_storage_settings` проверяет пути: существование, тип (папка), дубликаты, вложенность, возможность создать активную папку.

---

## Как добавить новую настройку

Нужно обновить пять мест, иначе настройка потеряется или сломает загрузку:

1. `backend/app/config/default_settings.py` — значение по умолчанию.
2. `backend/app/config/settings.json` — рабочая копия (или удалить файл, чтобы он пересоздался).
3. `backend/app/schemas/settings_schema.py` — поле и валидаторы в соответствующей модели.
4. `frontend/src/entities/settings/model/types.ts` — TypeScript-тип.
5. `frontend/src/entities/settings/model/labels.ts` — подпись поля (иначе в редакторе будет техническое имя) и, при необходимости, `SELECT_OPTIONS`/`NULLABLE_*`.

Если настройка должна отображаться в отдельной группе, добавьте её в `SECTION_LABELS` и `SECTION_ORDER` (`frontend/src/features/settings-editor/lib/settingsJson.ts`).

Если настройка влияет на результат анализа, добавьте её секцию в `RESULT_SETTINGS_SECTIONS` (`backend/app/config/config_loader.py`) — тогда она попадёт в хэш запуска и снимок параметров, и кэш не будет переиспользовать результат, посчитанный по другим настройкам.

---

## Редактор настроек в UI

`/settings` — универсальный редактор JSON-структуры:

- секции сворачиваются, есть поиск по названиям полей и значениям;
- типы полей определяются автоматически (`ObjectFields`, `ArrayEditor`, `OptionalField`, `JsonObjectField`);
- `storage.storages` редактируется отдельным компонентом `StorageManager`, остальные поля `storage` — обычным редактором;
- изменения копятся в черновике (`useSettingsDraft`) и сохраняются только по кнопке;
- после сохранения backend возвращает актуальный envelope, черновик синхронизируется;
- изменения реестра хранилищ сохраняются сразу через `/settings/storages`, после чего черновик перечитывает настройки, чтобы не перезаписать реестр устаревшими данными.

Ограничения редактора:

- нет отдельной формы с человекочитаемыми контролами для каждого поля — используется универсальный JSON-редактор;
- ошибки валидации показываются текстом, без привязки к конкретному полю;
- `allowed_sizes` редактируется как массив пар, без проверки, что размер действительно допустим для загрузки.
