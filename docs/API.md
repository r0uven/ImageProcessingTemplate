# HTTP API

Базовый URL: `http://127.0.0.1:8001` (порт задаётся при запуске Uvicorn; frontend берёт его из `frontend/.env`).

Интерактивная документация:
- Swagger UI — `http://127.0.0.1:8001/docs`
- ReDoc — `http://127.0.0.1:8001/redoc`

## Общие правила

- Формат — JSON (`application/json`), кроме загрузки файла (`multipart/form-data`), превью и артефактов (`image/png`), CSV (`text/csv`).
- CORS открыт для всех источников (`allow_origins=["*"]`, без credentials).
- Аутентификации и авторизации нет. API рассчитан на локальный запуск.
- Ошибки FastAPI имеют стандартный вид:

```json
{ "detail": "Image not found" }
```

Для ошибок валидации Pydantic `detail` — массив объектов с полем `loc`, `msg`, `type`.

- Настройки в `settings.json` и большинство ответов используют **snake_case**. Тело `AnalyzeRequest` и параметры обработки — **camelCase**, потому что так их формирует frontend; внутри backend они маппятся в snake_case (`app/mappers/processing_parameters_mapper.py`).

---

## System

### `GET /`

Проверка, что сервер запущен.

**200**

```json
{ "status": "ok" }
```

### `GET /health`

Health-check. Используется внешними проверками; лаунчер `dev.mjs` сейчас опрашивает `/docs`. Запросы к этому пути дополнительно логируются middleware.

**200**

```json
{ "status": "ok" }
```

### `GET /v1/models`

Заглушка OpenAI-совместимого списка моделей. Сейчас всегда возвращает `{ "status": "ok" }`.

---

## Settings

### `GET /settings`

Возвращает глобальные настройки вместе с метаданными файла и реестром хранилищ.

**200**

```json
{
  "settings": { "...": "полный AppSettings, см. docs/SETTINGS.md" },
  "config_path": "C:\\...\\backend\\app\\config\\settings.json",
  "images_directory": "data/images",
  "resolved_images_directory": "C:\\...\\backend\\data\\images",
  "active_storage_id": "default",
  "storages": [
    {
      "id": "default",
      "path": "data/images",
      "label": "Основное хранилище",
      "created_at": null,
      "last_used_at": null,
      "resolved_path": "C:\\...\\backend\\data\\images",
      "exists": true,
      "is_active": true
    }
  ],
  "updated_at": "2026-01-01T00:00:00+00:00"
}
```

`images_directory` — значение из настроек (может быть относительным). `resolved_images_directory` — абсолютный путь, который реально использует backend.

### `PUT /settings`

Валидирует и сохраняет настройки в `settings.json`, обновляет `APP_SETTINGS` в памяти и переключает активное хранилище без перезапуска.

**Тело:** полный объект `AppSettings` (см. [SETTINGS.md](SETTINGS.md)). Неизвестные поля запрещены (`extra="forbid"`).

**200** — тот же envelope, что у `GET /settings`, с новыми значениями.

**Ошибки**

| Код | Когда |
|---|---|
| `422` | Pydantic-валидация (`ValidationError`) |
| `400` | Нарушены правила хранилищ (`SettingsValidationError`): дубликаты id, вложенные папки, активное хранилище отсутствует в списке и т.п. |
| `500` | Не удалось записать файл (`OSError`) |

### `GET /settings/raw`

Возвращает текущие настройки без envelope (глубокую копию `APP_SETTINGS`). Фактически это тот же объект, что `settings` в `GET /settings`.

### `GET /settings/storages`

Реестр хранилищ с количеством изображений и размером папки.

**200**

```json
[
  {
    "id": "default",
    "path": "data/images",
    "resolved_path": "C:\\...\\backend\\data\\images",
    "label": "Основное хранилище",
    "created_at": "2026-01-01T00:00:00+00:00",
    "last_used_at": "2026-01-01T00:00:00+00:00",
    "is_active": true,
    "exists": true,
    "image_count": 12,
    "file_count": 87,
    "size_bytes": 123456789
  }
]
```

`image_count` считается по записям `images`, `file_count`/`size_bytes` — обходом папки.

### `POST /settings/storages`

Добавляет папку в реестр.

**Тело**

```json
{
  "path": "D:\\porous-data",
  "label": "Архив",
  "activate": false
}
```

`path` может быть абсолютным или относительным (от `backend/`). Если `activate=true` или это первое хранилище, оно становится активным.

**200** — обновлённый список `StorageInfo`.

**Ошибки**

| Код | Когда |
|---|---|
| `409` | Папка уже используется другим хранилищем или хранилища вложены друг в друга |
| `400` | Некорректный путь, путь указывает на файл, ошибка валидации |
| `500` | Не удалось сохранить настройки |

### `PATCH /settings/storages/{storage_id}`

Переименование и/или смена пути.

**Тело**

```json
{ "label": "Новое имя", "path": "E:\\moved-storage" }
```

Смена пути считается «переездом» папки: backend проверяет, что все файлы изображений из БД нашлись по новому корню, и переписывает абсолютные пути. Если хотя бы одного файла нет — операция отменяется с `400`.

**200** — обновлённый список.

**Ошибки:** `409` (конфликт пути), `400` (нет файлов по новому пути, некорректный путь), `500`.

### `POST /settings/storages/{storage_id}/activate`

Делает хранилище активным для новых загрузок. Архивные хранилища остаются доступными для чтения.

**200** — обновлённый список.

**Ошибки:** `400` (хранилище не найдено / путь указывает на файл), `409`, `500`.

### `DELETE /settings/storages/{storage_id}`

Удаляет хранилище из реестра.

**Query-параметры**

| Параметр | Тип | По умолчанию | Смысл |
|---|---|---|---|
| `delete_history` | bool | `false` | Удалить связанные изображения и запуски анализа |
| `delete_files` | bool | `false` | Удалить саму папку с диска |

**200** — обновлённый список.

Правила:

- нельзя удалить единственное хранилище (`409`);
- нельзя удалить активное хранилище (`409`) — сначала переключитесь на другое;
- если в хранилище есть изображения, нужен `delete_history=true` (`409`);
- `delete_files` запрещён для корня диска, домашней папки и папки backend (`400`).

---

## Uploads

### `POST /upload`

Загружает изображение файлом.

**Тело:** `multipart/form-data`, поле `file`.

```bash
curl -X POST http://127.0.0.1:8001/upload \
  -F "file=@sample.png"
```

**200**

```json
{
  "image_id": "3f0c...",
  "preview_url": "/images/3f0c.../preview",
  "width": 1024,
  "height": 1024
}
```

Если изображение с таким же SHA-256 уже загружено, возвращается существующий `image_id`; при необходимости восстанавливаются отсутствующие оригинал и превью.

**Ошибки**

| Код | Когда |
|---|---|
| `400` | Нет имени файла, пустой файл, неподдерживаемый формат, не удалось декодировать |
| `500` | Не удалось сохранить файл/превью/запись в БД |

### `POST /upload/path`

Импортирует изображение с локального диска. Байты не передаются по HTTP — backend копирует файл сам.

**Тело**

```json
{ "path": "C:\\images\\sample.bmp" }
```

Путь должен быть абсолютным и существовать.

**200** — как у `POST /upload`.

**Ошибки**

| Код | Когда |
|---|---|
| `400` | Пустой/относительный/некорректный путь, неподдерживаемый формат |
| `404` | Исходный файл не найден |
| `500` | Ошибка чтения/копирования файла |
| `400` | Файл скопирован, но не декодируется как изображение (копия удаляется) |

> Эндпоинт доверяет переданному пути и читает любой доступный файл. Это допустимо только для локального desktop-приложения без многопользовательского доступа.

---

## Analysis

### `POST /analysis/{image_id}`

Запускает анализ изображения. Результат детерминирован: одинаковые входные данные возвращают один и тот же `run_id` и кэшированный результат.

**Тело**

```json
{
  "parametersId": "случайный-uuid",
  "modelId": "default_model",
  "preprocessing": {
    "denoise": true,
    "normalize": true,
    "contrastEnhancement": false,
    "smoothing": false,
    "filterSize": 3,
    "preserveSize": true
  },
  "segmentation": {
    "method": "threshold",
    "outputMask": {
      "foregroundValue": 1,
      "backgroundValue": 0,
      "preserveSize": true
    },
    "threshold": {
      "thresholdValue": 128,
      "invert": false
    },
    "neural": {
      "modelType": null,
      "entities": {},
      "defaultConfidenceThreshold": 0.5,
      "device": "cpu"
    }
  },
  "separation": {
    "enabled": true,
    "applyOnlyToCandidates": true,
    "preserveAutonomousPores": true,
    "keepUnseparatedCandidates": true,
    "validateSeparationResult": true,
    "preserveParentLink": true,
    "evaluateSeparationQuality": true,
    "qualityMetrics": {
      "coveredArea": true,
      "lostArea": true,
      "extraArea": true,
      "coverageRatio": true,
      "extraRatio": false
    },
    "algorithmParams": {}
  }
}
```

Особенности:

- `parametersId` — случайный клиентский id; **не влияет** на результат и исключается из хэша.
- `modelId` должен существовать в таблице `segmentation_models`. Стандартная модель — `default_model` (создаётся миграцией `001_initial.sql`).
- `segmentation.method` — `"threshold"` или `"neural"`. `"neural"` сейчас приводит к ошибке.
- `separation.*` принимается, валидируется и сохраняется в снимке параметров, но пайплайн его пока не применяет.

**200**

```json
{
  "status": "success",
  "run_id": "64-символьный-sha256",
  "image_id": "3f0c...",
  "width": 1024,
  "height": 1024,
  "detected_objects": 42,
  "preprocessed_image": "/analysis/<run_id>/images/preprocessed",
  "segmentation_mask": "/analysis/<run_id>/images/segmentation",
  "postprocessed_mask": "/analysis/<run_id>/images/postprocessed",
  "detection_overlay": "/analysis/<run_id>/images/overlay"
}
```

Поля-ссылки равны `null`, если соответствующая настройка `analysis_pipeline.save_*` выключена.

**Ошибки**

| Код | Когда |
|---|---|
| `404` | Изображение не найдено в БД или отсутствует файл оригинала |
| `500` | Ошибка пайплайна (например, `method="neural"`, битая маска, ошибка записи) |

Неудачная попытка записывается в историю со `status="FAILED"` и текстом ошибки.

### `GET /analysis/{run_id}/images/{image_type}`

Отдаёт PNG одного из сохранённых артефактов.

`image_type`:

- `preprocessed`
- `segmentation`
- `postprocessed`
- `overlay`

**200** — `image/png`.

**404** — запуск/изображение не найдено или тип не сохранён. **422** — неизвестный `image_type` (не входит в `preprocessed`/`segmentation`/`postprocessed`/`overlay`).

### `GET /analysis/{run_id}/metrics`

Метрики завершённого запуска.

**200**

```json
{
  "filename": "sample.bmp",
  "detectedObjects": 42,
  "settingsUsed": {
    "version": 1,
    "request": {
      "preprocessing": { "...": "..." },
      "segmentation": { "...": "..." },
      "separation": { "...": "..." }
    },
    "global": {
      "image": { "...": "..." },
      "postprocessing": { "...": "..." },
      "object_detection": { "...": "..." },
      "feature_extraction": { "...": "..." }
    },
    "complete": true
  },
  "images": [
    { "type": "original", "url": "/images/<image_id>/preview" },
    { "type": "postprocessed", "url": "/analysis/<run_id>/images/postprocessed" },
    { "type": "overlay", "url": "/analysis/<run_id>/images/overlay" }
  ],
  "summary": {
    "poreCount": 42,
    "totalPoreArea": 15234.5,
    "porosityPercent": 1.45,
    "meanPoreArea": 362.7,
    "meanEquivalentRadius": 10.2,
    "minEquivalentRadius": 3.1,
    "maxEquivalentRadius": 24.8
  },
  "pores": [
    {
      "index": 1,
      "objectId": 1,
      "area": 123.4,
      "equivalentRadius": 6.27,
      "centerX": 120.5,
      "centerY": 340.2
    }
  ],
  "units": {
    "length": "px",
    "area": "px²",
    "coordinates": "px"
  },
  "distributions": {
    "PORE_SIZE": [{ "x": 12.5, "y": 1 }],
    "AREA": [{ "x": 123.4, "y": 1 }],
    "PERIMETER": [],
    "CIRCULARITY": [],
    "FORM_FACTOR": []
  },
  "statistics": {
    "PORE_SIZE": { "min": 0, "max": 0, "mean": 0, "median": 0, "standardDeviation": 0 },
    "AREA": { "min": 0, "max": 0, "mean": 0, "median": 0, "standardDeviation": 0 },
    "PERIMETER": { "min": 0, "max": 0, "mean": 0, "median": 0, "standardDeviation": 0 },
    "CIRCULARITY": { "min": 0, "max": 0, "mean": 0, "median": 0, "standardDeviation": 0 },
    "FORM_FACTOR": { "min": 0, "max": 0, "mean": 0, "median": 0, "standardDeviation": 0 }
  }
}
```

Особенности:

- `settingsUsed.complete=false` и `global=null` — старый запуск без снимка настроек; `request` восстановлен из `processing_parameters`.
- `PERIMETER`, `CIRCULARITY`, `FORM_FACTOR` пока всегда пустые/нулевые.
- `units` зависит от `feature_extraction.use_scale` и `scale_mm_per_pixel`.
- Для старых запусков без `size_distribution.pores` таблица восстанавливается из массивов `areas`/`diameters` (без координат).

**404** — запуск не найден.

### `GET /analysis/{run_id}/export/csv`

CSV с базовыми метриками и таблицей пор. Кодировка UTF-8 с BOM (`\ufeff`), разделитель `,`, перевод строки CRLF — файл корректно открывается в Excel.

**200**

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="pores_<run_id>.csv"
Access-Control-Expose-Headers: Content-Disposition
```

Содержимое:

1. Блок «Показатель, Значение, Единица»: файл, количество пор, суммарная площадь, пористость, средняя площадь, средний/мин/макс радиус.
2. Пустая строка.
3. Таблица пор: `№`, площадь, эквивалентный радиус, при наличии координат — `X`, `Y`.

**404** — запуск не найден.

---

## Images

### `GET /images`

Список всех загруженных изображений (записи `ImageModel`).

**200**

```json
[
  {
    "image_id": "3f0c...",
    "file_path": "C:\\...\\data\\images\\originals\\3f0c....bmp",
    "width": 1024,
    "height": 1024,
    "scale_value": 1.0,
    "content_hash": "sha256...",
    "original_image_name": "sample.bmp"
  }
]
```

### `GET /images/{image_id}`

Метаданные одного изображения.

**200** — объект `ImageModel`.

**404** — изображение не найдено.

### `GET /images/{image_id}/preview`

PNG-превью. Если файла превью нет на диске, он генерируется из оригинала через Matplotlib и сохраняется в кэш.

**200** — `image/png`.

**404** — изображение не найдено, файл вне зарегистрированных хранилищ или оригинал отсутствует.

---

## Tools (модели сегментации)

### `GET /tools`

Список моделей из `segmentation_models`, сначала новые.

**200**

```json
[
  {
    "model_id": "default_model",
    "model_name": "Threshold segmentation model",
    "model_type": "threshold",
    "model_path": null,
    "material": "Любой",
    "image": "data:image/jpeg;base64,...",
    "removable": false,
    "created_at": 1700000000
  }
]
```

`model_type`: `neural_network` | `classical` | `threshold`.

### `DELETE /tools/{model_id}`

Удаляет модель, если она `removable`.

**Обязательный заголовок**

```
X-Confirm-Delete: <model_id>
```

Заголовок должен дословно совпадать с id. Это защита от случайного удаления через прямую ссылку или HTML-форму.

**204** — удалено.

**Ошибки**

| Код | Когда |
|---|---|
| `428` | Нет заголовка или он не совпадает с id |
| `404` | Модель не найдена |
| `403` | `removable=false` |
| `409` | Модель используется (нарушение внешнего ключа) или удаление не удалось |

---

## History

### `GET /history`

Список запусков анализа для таблицы истории, сначала новые.

**200**

```json
[
  {
    "run_id": "64-символьный-sha256",
    "image_id": "3f0c...",
    "filename": "sample.bmp",
    "modelName": "Threshold segmentation model",
    "createdAt": "01.01.2026 12:00",
    "duration": 0.842,
    "width": 1024,
    "height": 1024,
    "status": "SUCCESS",
    "error": null,
    "previewUrl": "/analysis/<run_id>/images/overlay"
  }
]
```

Особенности:

- `previewUrl` выбирается по первой включённой настройке: `overlay` → `postprocessed` → `segmentation` → `preprocessed`.
- Если оригинал изображения удалён или путь вне хранилищ, статус принудительно становится `FAILED`, а `error` заполняется пояснением.
- `createdAt` — строка `dd.MM.yyyy HH:mm` в UTC.
- `duration` — секунды, округлено до 3 знаков.
- Пагинации нет: возвращаются все запуски.

### `DELETE /history/{run_id}`

Удаляет запуск: запись `analysis_runs`, связанные `analysis_results`/`processing_parameters`, маски и файлы анализа.

**204** — удалено.

**404** — запуск не найден.

---

## Модели данных

### `AnalyzeRequest`

| Поле | Тип | Описание |
|---|---|---|
| `parametersId` | string | Клиентский id набора параметров (не влияет на результат) |
| `modelId` | string | id модели из `segmentation_models` |
| `preprocessing.denoise` | bool | Шумоподавление (`fastNlMeansDenoising`) |
| `preprocessing.normalize` | bool | Min-max нормализация в `image.pixel_value_range` |
| `preprocessing.contrastEnhancement` | bool | CLAHE по L-каналу LAB / `equalizeHist` для grayscale |
| `preprocessing.smoothing` | bool | Gaussian blur |
| `preprocessing.filterSize` | int | Размер ядра; чётное значение увеличивается на 1 |
| `preprocessing.preserveSize` | bool | Вернуть исходный размер после обработки |
| `segmentation.method` | string | `threshold` или `neural` |
| `segmentation.outputMask.foregroundValue` | int | Значение пикселя объекта в сохраняемой маске |
| `segmentation.outputMask.backgroundValue` | int | Значение пикселя фона |
| `segmentation.outputMask.preserveSize` | bool | Сохранять размер маски |
| `segmentation.threshold.thresholdValue` | int | Порог 0…255 |
| `segmentation.threshold.invert` | bool | Инвертировать результат threshold |
| `segmentation.neural.modelType` | string \| null | Выбранная нейромодель |
| `segmentation.neural.entities` | object | Параметры сущностей модели |
| `segmentation.neural.defaultConfidenceThreshold` | float | Порог уверенности 0…1 |
| `segmentation.neural.device` | string | `cpu` / `cuda` и т.п. |
| `separation.enabled` | bool | Включить разделение слипшихся пор |
| `separation.applyOnlyToCandidates` | bool | Применять только к кандидатам |
| `separation.preserveAutonomousPores` | bool | Сохранять автономные поры |
| `separation.keepUnseparatedCandidates` | bool | Сохранять неразделённые кандидаты |
| `separation.validateSeparationResult` | bool | Проверять результат разделения |
| `separation.preserveParentLink` | bool | Сохранять связь с родительским объектом |
| `separation.evaluateSeparationQuality` | bool | Считать метрики качества |
| `separation.qualityMetrics.*` | bool | Набор метрик качества |
| `separation.algorithmParams` | object | Свободные параметры алгоритма |

### `ProcessingMetrics`

См. пример ответа `GET /analysis/{run_id}/metrics`. TypeScript-тип — `frontend/src/entities/analysis/model/types.ts`, функция сборки — `backend/app/services/metrics.py::build_metrics`.

### `SettingsEnvelope`

| Поле | Тип | Описание |
|---|---|---|
| `settings` | `AppSettings` | Полные настройки |
| `config_path` | string | Абсолютный путь к `settings.json` |
| `images_directory` | string | Путь активного хранилища как записан в настройках |
| `resolved_images_directory` | string | Абсолютный путь активного хранилища |
| `active_storage_id` | string | id активного хранилища |
| `storages` | `StorageStatus[]` | Реестр с `resolved_path`, `exists`, `is_active` |
| `updated_at` | string | ISO-время формирования ответа |

### `StorageInfo`

| Поле | Тип | Описание |
|---|---|---|
| `id` | string | id хранилища |
| `path` | string | Путь как в настройках |
| `resolved_path` | string | Абсолютный путь |
| `label` | string | Отображаемое имя |
| `created_at` | string \| null | Когда добавлено |
| `last_used_at` | string \| null | Когда активировано |
| `is_active` | bool | Активно ли |
| `exists` | bool | Существует ли папка |
| `image_count` | int | Изображений в БД, привязанных к корню |
| `file_count` | int | Всего файлов в папке |
| `size_bytes` | int | Размер папки |

### `HistoryItem`

| Поле | Тип | Описание |
|---|---|---|
| `run_id` | string | id запуска |
| `image_id` | string | id изображения |
| `filename` | string | Исходное имя файла |
| `modelName` | string | Имя модели из справочника или `model_id` |
| `createdAt` | string | `dd.MM.yyyy HH:mm` (UTC) |
| `duration` | number | Секунды |
| `width`, `height` | int | Размеры оригинала |
| `status` | `SUCCESS` \| `FAILED` | Статус |
| `error` | string \| null | Текст ошибки |
| `previewUrl` | string \| null | Ссылка на превью результата |

### `ImageModel`

| Поле | Тип | Описание |
|---|---|---|
| `image_id` | string | UUID |
| `file_path` | string | Абсолютный путь к оригиналу |
| `width`, `height` | int | Размеры после применения `image.*` |
| `scale_value` | float | Масштаб изображения (сейчас всегда `1.0`) |
| `content_hash` | string \| null | SHA-256 содержимого |
| `original_image_name` | string \| null | Имя загруженного файла |

---

## Примеры

### Полный сценарий через curl

```bash
# 1. Проверить, что backend жив
curl http://127.0.0.1:8001/health

# 2. Загрузить изображение
curl -X POST http://127.0.0.1:8001/upload -F "file=@sample.bmp"

# 3. Запустить анализ (подставьте image_id из шага 2)
curl -X POST http://127.0.0.1:8001/analysis/<image_id> \
  -H "Content-Type: application/json" \
  -d '{
    "parametersId": "demo",
    "modelId": "default_model",
    "preprocessing": {
      "denoise": true, "normalize": true, "contrastEnhancement": false,
      "smoothing": false, "filterSize": 3, "preserveSize": true
    },
    "segmentation": {
      "method": "threshold",
      "outputMask": { "foregroundValue": 1, "backgroundValue": 0, "preserveSize": true },
      "threshold": { "thresholdValue": 128, "invert": false },
      "neural": { "modelType": null, "entities": {}, "defaultConfidenceThreshold": 0.5, "device": "cpu" }
    },
    "separation": {
      "enabled": true, "applyOnlyToCandidates": true, "preserveAutonomousPores": true,
      "keepUnseparatedCandidates": true, "validateSeparationResult": true,
      "preserveParentLink": true, "evaluateSeparationQuality": true,
      "qualityMetrics": {
        "coveredArea": true, "lostArea": true, "extraArea": true,
        "coverageRatio": true, "extraRatio": false
      },
      "algorithmParams": {}
    }
  }'

# 4. Получить метрики (run_id из ответа шага 3)
curl http://127.0.0.1:8001/analysis/<run_id>/metrics

# 5. Скачать CSV
curl -OJ http://127.0.0.1:8001/analysis/<run_id>/export/csv
```

### Импорт по пути (Windows)

```bash
curl -X POST http://127.0.0.1:8001/upload/path \
  -H "Content-Type: application/json" \
  -d '{"path":"C:\\images\\sample.bmp"}'
```

### Удаление модели

```bash
curl -X DELETE http://127.0.0.1:8001/tools/my_model \
  -H "X-Confirm-Delete: my_model"
```

---

## Соответствие frontend → backend

| Frontend-функция | Файл | Эндпоинт |
|---|---|---|
| `uploadImage` | `entities/analysis/api/uploadImage.ts` | `POST /upload` |
| `uploadImageByPath` | `entities/analysis/api/uploadImage.ts` | `POST /upload/path` |
| `analyzeImage` | `entities/analysis/api/analysisApi.ts` | `POST /analysis/{image_id}` |
| `getProcessingMetrics` | `entities/analysis/api/getMetrics.ts` | `GET /analysis/{run_id}/metrics` |
| `savePoresCsv` | `entities/analysis/api/exportPoresCsv.ts` | `GET /analysis/{run_id}/export/csv` |
| `getHistory` | `entities/history/api/getHistory.ts` | `GET /history` |
| `deleteHistoryItem` | `entities/history/api/deleteHistoryItem.ts` | `DELETE /history/{run_id}` |
| `getTools` | `entities/tool/api/tools.api.ts` | `GET /tools` |
| `deleteTool` | `entities/tool/api/tools.api.ts` | `DELETE /tools/{model_id}` |
| `getSettings` / `saveSettings` | `entities/settings/api/settings.api.ts` | `GET/PUT /settings` |
| `getStorages` и мутации | `features/storage-manager/api/storage.api.ts` | `/settings/storages...` |
| `buildMediaUrl` | `shared/api/client.ts` | Собирает полный URL из относительных путей ответов |
