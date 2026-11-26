# Система анализа пористой структуры

Приложение для анализа изображений пористых материалов: загрузка снимка, предобработка, сегментация, поиск пор, расчёт характеристик и визуализация результатов. Состоит из backend на FastAPI и desktop-клиента на React + Tauri.

> **Статус проекта:** рабочий прототип. Полный цикл «загрузить изображение → обработать → посмотреть метрики → экспортировать CSV» реализован. Нейросетевая сегментация, разделение слипшихся пор, классификация объектов и обучение моделей пока не реализованы — вместо них используются пороговая сегментация и детектор на связных компонентах. Полный список заглушек и точек расширения — в [docs/TODO.md](docs/TODO.md).

---

## Содержание

- [Что уже работает](#что-уже-работает)
- [Чего пока нет](#чего-пока-нет)
- [Стек](#стек)
- [Архитектура](#архитектура)
- [Структура репозитория](#структура-репозитория)
- [Быстрый старт](#быстрый-старт)
- [Запуск](#запуск)
- [Конфигурация](#конфигурация)
- [Как проходит анализ](#как-проходит-анализ)
- [API](#api)
- [База данных](#база-данных)
- [Frontend](#frontend)
- [Проверки качества кода](#проверки-качества-кода)
- [Известные проблемы и ограничения](#известные-проблемы-и-ограничения)
- [Где что менять](#где-что-менять)
- [Документация](#документация)

---

## Что уже работает

| Возможность | Где реализовано |
|---|---|
| Загрузка изображения файлом (`multipart/form-data`) | `POST /upload`, `backend/app/services/image_upload.py` |
| Импорт изображения по локальному пути без передачи байтов по HTTP | `POST /upload/path`, `ImageUploadService.upload_path` |
| Дедупликация изображений по SHA-256 | `ImageRepository.get_by_hash`, `content_hash` в БД |
| Предобработка: нормализация, шумоподавление, CLAHE-контраст, Gaussian blur | `backend/app/modules/preprocessing/preprocessor.py` |
| Пороговая сегментация (OpenCV threshold) | `backend/app/modules/segmentation/threshold_segmenter.py` |
| Постобработка маски: удаление мелких объектов, заполнение дыр, морфология | `backend/app/modules/postprocessing/postprocessor.py` |
| Поиск пор как связных компонент | `backend/app/modules/object_detection/mock_detector.py` |
| Расчёт площади, диаметра, пористости и таблицы пор | `backend/app/modules/feature_extraction/feature_extractor.py` |
| Детерминированный `run_id` и кэш повторных запусков | `backend/app/utils/run_hash.py`, `AnalysisService.analyze` |
| История запусков со статусом, длительностью и ошибками | `GET /history`, `backend/app/services/history.py` |
| Метрики: сводка, таблица пор, распределения, статистика | `GET /analysis/{run_id}/metrics`, `backend/app/services/metrics.py` |
| Экспорт CSV с BOM для Excel | `GET /analysis/{run_id}/export/csv` |
| Просмотр оригинала, маски, постобработанной маски и оверлея | `GET /analysis/{run_id}/images/{type}` |
| Глобальные настройки с валидацией и hot-reload без перезапуска | `backend/app/config/`, страница `/settings` |
| Реестр хранилищ (несколько папок, активная/архивные) | `backend/app/services/storage_registry.py` |
| Очистка кэша превью по возрасту и размеру | `ImageStorage.cleanup_cache`, фоновая задача в `main.py` |
| Переключение вида «оригинал / обработано / с разметкой» | `frontend/src/widgets/workspace-viewer` |
| Сохранение состояния рабочей области между переходами | `frontend/src/entities/workspace/model/workspaceStore.ts` |
| Экспорт CSV в Tauri через нативный диалог, в браузере — через File System Access API | `frontend/src/entities/analysis/api/exportPoresCsv.ts` |

## Чего пока нет

Подробно с планом реализации — [docs/TODO.md](docs/TODO.md).

- Нейросетевая сегментация: выбор `method: "neural"` приводит к ошибке `500`/записи `FAILED` в истории.
- Реальный детектор: `MockDetector` — это классический алгоритм на `skimage.measure.label`, а не ML-модель.
- Разделение слипшихся пор, объединение пор, классификация объектов: параметры принимаются и валидируются, но пайплайн их не использует.
- Таблицы `objects` и `pores` не заполняются (есть только схема БД).
- Обучение моделей: страницы `/neural-networks/create`, `/neural-networks/:id/training`, `/training/:id/result` работают на имитации и тестовых данных; backend-эндпоинтов обучения нет.
- Создание/обновление моделей через API: `segmentation_models` только читается и удаляется.
- Метрики `PERIMETER`, `CIRCULARITY`, `FORM_FACTOR` возвращаются пустыми заглушками.
- Персональный масштаб изображения (`images.scale_value`) всегда `1.0`; работает только глобальный `feature_extraction.scale_mm_per_pixel`.
- Автотесты (pytest/vitest) отсутствуют.
- Аутентификация и авторизация отсутствуют; CORS открыт для всех.

---

## Стек

**Backend**
- Python 3.14 (используется `py` launcher на Windows), FastAPI, Uvicorn
- SQLite (стандартный `sqlite3`), SQL-миграции
- NumPy, OpenCV, scikit-image, SciPy, Pillow, Matplotlib
- Ruff (линтер/форматтер), mypy (типизация)

**Frontend**
- React 19, TypeScript 6, Vite 8
- React Router 7, Axios
- styled-components, framer-motion, Recharts, date-fns
- Tauri 2 (`@tauri-apps/api`, плагины `dialog` и `log`)
- ESLint 10, typescript-eslint

**Инструменты разработки**
- `dev.mjs` — последовательный запуск backend и frontend
- `ecosystem.config.js` — запуск через PM2
- VS Code (`.vscode/`)

---

## Архитектура

```
┌──────────────────────────────┐        HTTP/JSON        ┌──────────────────────────────┐
│  Tauri + React (frontend)    │  localhost:8001         │  FastAPI (backend)           │
│                              │ ◄─────────────────────► │                              │
│  pages → widgets → features  │                         │  api/routers                 │
│  entities → shared           │                         │  services                    │
│                              │                         │  pipeline                    │
│  axios client, sessionStorage│                         │  modules (cv2/skimage)       │
└──────────────────────────────┘                         │  storage (files)             │
                                                         │  database (SQLite)           │
                                                         └──────────────┬───────────────┘
                                                                        │
                                              ┌─────────────────────────┴────────────────────────┐
                                              │ backend/data/database.db                         │
                                              │ backend/data/images/ (originals/previews/analysis)│
                                              └──────────────────────────────────────────────────┘
```

Backend построен по слоям:

1. **API** (`app/api`) — роутеры, зависимости FastAPI, константы, формирование ответов.
2. **Сервисы** (`app/services`) — оркестрация: анализ, загрузка, метрики, история, реестр хранилищ, снимки настроек.
3. **Пайплайн** (`app/pipeline`) — последовательный вызов модулей обработки через `PipelineContext`.
4. **Модули** (`app/modules`) — независимые шаги: загрузчик, предобработка, сегментация, постобработка, детекция, признаки, визуализация.
5. **Домен** (`app/entities`, `app/schemas`, `app/mappers`) — dataclass-сущности, Pydantic-схемы запросов, маппинг camelCase → snake_case.
6. **Инфраструктура** (`app/database`, `app/storage`, `app/config`, `app/utils`) — SQLite, файловое хранилище, настройки, утилиты.

Frontend организован по методологии **Feature-Sliced Design**:

```
app → pages → widgets → features → entities → shared
```

- `app` — провайдеры и маршрутизация.
- `pages` — экраны приложения.
- `widgets` — крупные самостоятельные блоки страницы (просмотр изображения, карточки метрик).
- `features` — пользовательские сценарии (загрузка, редактор настроек, менеджер хранилищ, AI-датасет).
- `entities` — бизнес-сущности и их API (analysis, history, settings, tool, workspace, training).
- `shared` — UI-кит, стили, утилиты, HTTP-клиент.

---

## Структура репозитория

```
ImageProcessingTemplate/
├── backend/
│   ├── main.py                     # Точка входа FastAPI: lifespan, БД, роутеры, CORS
│   ├── requirements.txt            # Python-зависимости (без версий)
│   ├── app/
│   │   ├── api/
│   │   │   ├── constants.py        # Типы изображений анализа, заголовок подтверждения удаления
│   │   │   ├── dependencies.py     # Depends-алиасы для сервисов из app.state
│   │   │   ├── responses.py        # JSON-ответы upload/analysis
│   │   │   └── routers/            # system, settings, uploads, analysis, images, tools, history
│   │   ├── config/
│   │   │   ├── config_loader.py    # Чтение/merge/атомарная запись settings.json
│   │   │   ├── default_settings.py # Эталонные настройки
│   │   │   ├── settings_service.py # Валидация, envelope, hot-reload
│   │   │   └── settings.json       # Рабочая копия настроек (может отличаться от дефолтов)
│   │   ├── database/
│   │   │   ├── connection.py       # SQLite-соединение, PRAGMA foreign_keys
│   │   │   ├── migrator.py         # Применение SQL-миграций
│   │   │   ├── models.py           # Dataclass-модели строк БД
│   │   │   ├── migrations/         # 001…006, схема и история изменений
│   │   │   └── repositories/       # image, analysis, mask, tool
│   │   ├── entities/               # ProcessingParameters, ImageData, PoreObject, AnalysisResult
│   │   ├── mappers/                # AnalyzeRequest → ProcessingParameters
│   │   ├── modules/
│   │   │   ├── image_loader/       # Декодирование, проверка формата, превью
│   │   │   ├── preprocessing/      # Нормализация, denoise, CLAHE, blur
│   │   │   ├── segmentation/       # Пороговая сегментация
│   │   │   ├── postprocessing/     # Удаление шума, fill holes, морфология
│   │   │   ├── object_detection/   # DetectorInterface + MockDetector
│   │   │   ├── feature_extraction/ # Площади, диаметры, пористость, таблица пор
│   │   │   └── visualisation/      # Overlay с рамками объектов
│   │   ├── pipeline/               # AnalysisPipeline и PipelineContext
│   │   ├── schemas/                # Pydantic: AnalyzeRequest, AppSettings, UploadPathRequest
│   │   ├── services/               # analysis, image_upload, metrics, history, storage_registry, run_snapshot
│   │   ├── storage/                # ImageStorage: файлы, кэш, пути, очистка
│   │   └── utils/                  # run_hash, image_processing, pretty_image
│   ├── data/                       # Создаётся автоматически: database.db, images/ (в .gitignore)
│   └── app.log                     # Лог backend (в .gitignore)
├── frontend/
│   ├── src/
│   │   ├── app/                    # App, main, router
│   │   ├── pages/                  # landing, workspace, history, metrics, settings, create-ai, training-*
│   │   ├── widgets/                # workspace-viewer, processing-settings, metrics-*, pore-metrics
│   │   ├── features/               # workspace-upload, settings-editor, storage-manager, ai-dataset
│   │   ├── entities/               # analysis, history, settings, tool, workspace, training
│   │   └── shared/                 # api/client, lib, styles, ui
│   ├── src-tauri/                  # Tauri 2: конфиг, Rust-команда save_text_file
│   ├── public/test/                # Тестовые изображения для демо-страницы результатов обучения
│   ├── .env                        # VITE_API_URL=http://localhost:8001
│   ├── vite.config.ts              # alias @ → src, svgr
│   └── package.json
├── docs/
│   ├── API.md                      # Полное описание HTTP API
│   ├── SETTINGS.md                 # Все секции settings.json и их влияние
│   └── TODO.md                     # Заглушки, долги и точки расширения
├── dev.mjs                         # Запуск backend → ожидание /docs → запуск Tauri
├── ecosystem.config.js             # PM2-конфигурация
├── package.json                    # Корневой скрипт dev
├── app.log                         # Лог PM2/лаунчера (в .gitignore)
└── README.md
```

---

## Быстрый старт

### Требования

- **Windows** (основная платформа; на Linux/macOS потребуется заменить `py` на `python3` в `dev.mjs`).
- Python 3.14+ и `py` launcher.
- Node.js 20+ и npm.
- Rust toolchain и системные зависимости Tauri — только если нужен desktop-режим (`npm run tauri dev`). Для запуска в браузере Rust не нужен.

### Установка

```bash
# зависимости backend
cd backend
py -m pip install -r requirements.txt

# зависимости frontend
cd ../frontend
npm install
```

Корневой `npm install` не обязателен: у корневого `package.json` нет зависимостей, только скрипт `dev`.

---

## Запуск

### Вариант 1. Два терминала (рекомендуется для отладки)

**Backend:**

```bash
cd backend
py -m uvicorn main:app --reload --port 8001
```

**Frontend (Tauri):**

```bash
cd frontend
npm run tauri dev
```

**Frontend в обычном браузере (без Rust):**

```bash
cd frontend
npm run dev
```

Открыть `http://localhost:5173`.

> Порт **8001** важен: frontend берёт адрес из `frontend/.env` (`VITE_API_URL=http://localhost:8001`). Если запустить Uvicorn без `--port 8001`, он займёт `8000`, и клиент не сможет подключиться.

### Вариант 2. Один терминал через `dev.mjs`

```bash
npm run dev
```

Что делает скрипт:

1. Запускает `py -m uvicorn main:app --reload --port 8001` в `./backend`.
2. Опрашивает `http://127.0.0.1:8001/docs` каждые 500 мс (таймаут 30 с).
3. После готовности backend запускает `npm run tauri dev` в `./frontend`.
4. При Ctrl+C или падении любого сервиса завершает всё дерево процессов (`taskkill /f /t` на Windows).

### Вариант 3. PM2

```bash
pm2 start ecosystem.config.js
pm2 logs
pm2 delete all
```

> **Внимание:** `ecosystem.config.js` запускает backend **без** `--port 8001`, поэтому frontend с текущим `.env` не подключится. Перед использованием PM2 добавьте `--port 8001` в `args` (см. [docs/TODO.md](docs/TODO.md#19-инфраструктура-запуска-p2)).

### Адреса и файлы

| Что | Значение |
|---|---|
| Backend API | `http://127.0.0.1:8001` |
| Swagger UI | `http://127.0.0.1:8001/docs` |
| ReDoc | `http://127.0.0.1:8001/redoc` |
| Vite dev server | `http://localhost:5173` |
| SQLite | `backend/data/database.db` |
| Изображения (по умолчанию) | `backend/data/images/` |
| Настройки | `backend/app/config/settings.json` |
| Лог backend | `backend/app.log` |

---

## Конфигурация

Все параметры приложения хранятся в `backend/app/config/settings.json`. Файл можно редактировать вручную или через страницу **«Настройки»** в приложении. Изменения применяются без перезапуска backend.

Ключевые принципы:

- Эталон значений — `backend/app/config/default_settings.py`. При добавлении новых полей обновляйте **и** его, **и** `settings.json`, **и** Pydantic-схему `app/schemas/settings_schema.py`, **и** TypeScript-типы `frontend/src/entities/settings/model/types.ts`.
- Если `settings.json` отсутствует, пуст или содержит невалидный JSON, backend создаёт его из дефолтов. Повреждённый файл сохраняется рядом как `settings.json.broken-<timestamp>`.
- Файл пишется атомарно (временный файл + `os.replace`).
- При чтении настройки рекурсивно дополняются недостающими полями из дефолтов, поэтому старые конфиги не ломают приложение.
- Валидация выполняется Pydantic-схемой `AppSettings` (`extra="forbid"` — неизвестные поля запрещены) плюс проверками путей хранилищ.

Подробное описание каждой секции, поля и влияния на обработку — в [docs/SETTINGS.md](docs/SETTINGS.md).

### Переменные окружения frontend

`frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:8001
```

Переопределяет базовый URL API. Fallback в коде — `http://127.0.0.1:8001`.

---

## Как проходит анализ

### 1. Загрузка

Два пути:

- **Tauri:** `open()` из `@tauri-apps/plugin-dialog` → путь к файлу → `POST /upload/path` с `{ "path": "C:\\..." }`. Байты не идут через HTTP; backend считает SHA-256 файла потоково и копирует его в активное хранилище.
- **Браузер:** `<input type="file">` → `POST /upload` с `multipart/form-data`.

Backend:

1. Проверяет расширение по `image.allowed_formats`.
2. Декодирует через OpenCV (`cv2.imdecode`; для путей — `np.fromfile`, чтобы работали не-ASCII имена на Windows).
3. Применяет `image.resize_on_load` и `image.grayscale`.
4. Строит «красивое» превью через Matplotlib (`make_pretty_image_plot`).
5. Ищет дубликат по `content_hash`. Если найден — возвращает существующий `image_id`, при необходимости восстанавливает отсутствующий оригинал/превью.
6. Иначе сохраняет оригинал и превью, создаёт запись в `images`.

Ответ:

```json
{
  "image_id": "uuid",
  "preview_url": "/images/<image_id>/preview",
  "width": 1024,
  "height": 1024
}
```

### 2. Запуск анализа

`POST /analysis/{image_id}` с телом `AnalyzeRequest` (см. [docs/API.md](docs/API.md#post-analysisimage_id)).

Сервис `AnalysisService`:

1. Проверяет существование изображения.
2. Считает `run_id` = SHA-256 от:
   - `hash_version` (сейчас `3`);
   - `image_id`;
   - `model_id`;
   - параметров запроса (preprocessing, segmentation, separation) **без** случайного `parametersId`;
   - глобальных секций `image`, `postprocessing`, `object_detection`, `feature_extraction`.

   Одинаковые входные данные всегда дают одинаковый `run_id`.
3. Проверяет кэш: если в БД есть `SUCCESS`-запуск с таким `run_id` и все включённые изображения есть на диске — возвращает результат без повторной обработки.
4. Иначе загружает оригинал, собирает `PipelineContext`, запускает пайплайн.
5. Сохраняет изображения согласно `analysis_pipeline` и записи в БД.
6. При ошибке записывает `FAILED`-запуск с текстом исключения и пробрасывает ошибку клиенту. Повторный запуск того же кейса удалит старую `FAILED`-запись и попробует снова.

### 3. Пайплайн

`backend/app/pipeline/analysis_pipeline.py`:

```
original_image
   │
   ▼
Preprocessor.preprocess          # normalize, denoise, CLAHE, GaussianBlur
   │
   ▼
ThresholdSegmenter.segment       # cv2.threshold → bool-маска
   │
   ▼
Postprocessor.postprocess        # remove_small_objects, fill_holes, morphology
   │
   ▼
MockDetector.detect              # skimage label + regionprops
   │
   ▼
FeatureExtractor.extract         # площади, диаметры, пористость, таблица пор
   │
   ▼
AnalysisResult + PoreObject[]
```

Важная особенность: **в маске `True` — это материал (светлые пиксели выше порога), а поры — `False`.** Постобработка и детектор работают с инвертированной маской (`~mask`), где поры становятся `True`. Это нужно учитывать при замене сегментации или детектора.

### 4. Артефакты запуска

`analysis_pipeline` управляет тем, что сохраняется на диск:

| Настройка | Что сохраняется | URL |
|---|---|---|
| `save_intermediate_results` | предобработанное изображение | `/analysis/{run_id}/images/preprocessed` |
| `save_segmentation_mask` | сырая маска (`raw`) | `/analysis/{run_id}/images/segmentation` |
| `save_postprocessed_mask` | очищенная маска (`cleaned`) | `/analysis/{run_id}/images/postprocessed` |
| `save_final_objects` | оверлей с рамками и номерами пор | `/analysis/{run_id}/images/overlay` |
| `save_run_parameters` | JSON-снимок параметров в `analysis_runs.settings_snapshot` | — |

Если настройка выключена, соответствующий URL в ответе будет `null`, а файл не создаётся. `save_classification_result`, `save_separation_result`, `save_features` пока не используются.

### 5. Метрики

`GET /analysis/{run_id}/metrics` собирает данные из `analysis_results.size_distribution` и агрегатов БД:

- `summary` — количество пор, суммарная площадь, пористость, средние/мин/макс радиусы;
- `pores` — таблица `object_id`, площадь, эквивалентный радиус, координаты центра;
- `distributions` — точки для графиков (`PORE_SIZE`, `AREA`; остальные пока пустые);
- `statistics` — min/max/mean/median/std для каждого распределения;
- `units` — `px`/`px²` или `мм`/`мм²` в зависимости от `feature_extraction.use_scale`;
- `settingsUsed` — снимок параметров запуска (для старых запусков — частичное восстановление);
- `images` — реально доступные изображения оригинала и артефактов.

Для старых записей без подробного распределения метрики восстанавливаются из агрегатов (`area`, `diameter`, `pore_count`).

---

## API

Полная спецификация с примерами запросов/ответов и кодами ошибок — [docs/API.md](docs/API.md). Интерактивная документация — Swagger UI на `/docs`.

Краткая карта:

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/` | Проверка, что сервер запущен |
| `GET` | `/health` | Health-check |
| `GET` | `/v1/models` | Заглушка OpenAI-совместимого списка моделей |
| `GET` | `/settings` | Настройки + метаданные + реестр хранилищ |
| `PUT` | `/settings` | Сохранить настройки и применить без перезапуска |
| `GET` | `/settings/raw` | Плоский снимок настроек |
| `GET` | `/settings/storages` | Реестр хранилищ со статистикой |
| `POST` | `/settings/storages` | Добавить хранилище |
| `PATCH` | `/settings/storages/{id}` | Переименовать / сменить путь |
| `POST` | `/settings/storages/{id}/activate` | Сделать хранилище активным |
| `DELETE` | `/settings/storages/{id}` | Удалить из реестра (`?delete_files`, `?delete_history`) |
| `POST` | `/upload` | Загрузить изображение файлом |
| `POST` | `/upload/path` | Импортировать изображение по пути |
| `POST` | `/analysis/{image_id}` | Запустить анализ |
| `GET` | `/analysis/{run_id}/images/{type}` | PNG артефакта (`preprocessed`/`segmentation`/`postprocessed`/`overlay`) |
| `GET` | `/analysis/{run_id}/metrics` | Метрики запуска |
| `GET` | `/analysis/{run_id}/export/csv` | CSV с метриками и таблицей пор |
| `GET` | `/images` | Список изображений |
| `GET` | `/images/{image_id}` | Метаданные изображения |
| `GET` | `/images/{image_id}/preview` | PNG-превью (лениво генерируется) |
| `GET` | `/tools` | Список моделей сегментации |
| `DELETE` | `/tools/{model_id}` | Удалить модель (нужен `X-Confirm-Delete: model_id`) |
| `GET` | `/history` | История запусков |
| `DELETE` | `/history/{run_id}` | Удалить запуск вместе с файлами |

---

## База данных

SQLite, файл `backend/data/database.db`. Миграции применяются автоматически при старте (`app/database/migrator.py`), версии фиксируются в таблице `migrations`.

| Таблица | Назначение | Статус |
|---|---|---|
| `images` | Загруженные изображения: путь, размеры, хэш, исходное имя, масштаб | Используется |
| `processing_parameters` | JSON-снимки preprocessing/segmentation/separation | Используется |
| `segmentation_models` | Справочник моделей; `default_model` создаётся миграцией | Читается и удаляется |
| `analysis_results` | Агрегаты: количество пор, пористость, площадь, диаметр, распределение | Используется |
| `analysis_runs` | Запуски: статус, длительность, ошибка, снимок настроек | Используется |
| `masks` | Метаданные масок (`raw`/`cleaned`), файлы лежат в хранилище | Используется |
| `objects` | Объекты: тип и статус обработки | **Не заполняется** |
| `pores` | Поры: тип, родительский объект, центроид | **Не заполняется** |

Схема и комментарии — `backend/app/database/migrations/001_initial.sql` … `006_analysis_failures.sql`.

Особенности:

- `analysis_runs.model_id` — внешний ключ на `segmentation_models`, поэтому `modelId` в запросе анализа должен существовать (для стандартного сценария — `default_model`).
- `run_id` — первичный ключ и одновременно ключ кэша.
- Неудачные запуски хранятся с `status='FAILED'`, `params_id=NULL`, `analysis_result_id=NULL`.
- `PRAGMA foreign_keys = ON` включается вручную в `connection.py`.
- При удалении запуска каскадно удаляются маски; результаты и параметры удаляются явно в `AnalysisRepository.delete_run`.

---

## Frontend

### Маршруты

| Путь | Страница | Состояние |
|---|---|---|
| `/` | `LandingPage` — список моделей, настройки, история | Работает |
| `/workspace/:toolId` | `WorkspacePage` — загрузка, настройки, обработка, просмотр | Работает |
| `/history` | `HistoryPage` — поиск, фильтры, сортировка, удаление | Работает |
| `/metrics/:runId` | `ProcessingMetricsPage` — метрики, графики, изображения, CSV | Работает |
| `/settings` | `SettingsPage` — редактор `settings.json`, хранилища | Работает |
| `/neural-networks/create` | `CreateAiPage` — форма создания модели и датасет | Имитация |
| `/neural-networks/:id/training` | `TrainingProcessPage` — прогресс обучения | Имитация |
| `/training/:id/result` | `TrainingResultPage` — результаты и сравнение | Тестовые данные |

### Ключевые решения

- **Настройки загружаются один раз** в `SettingsProvider`; пока ответа нет, показывается заглушка с кнопкой «Повторить».
- **Состояние рабочей области** хранится в модульном сторе (`workspaceStore.ts`) с сохранением в `sessionStorage` под ключом `workspace-state-v1:<toolId>`. Возврат со страницы метрик не сбрасывает изображение и настройки.
- **Fingerprint запуска** (`createRunFingerprint`) сравнивает `imageId + processingSettings`. Если пользователь изменил настройки после обработки, кнопка «Вычислить характеристики» блокируется до повторного запуска.
- **Загрузка** использует нативный диалог Tauri; в браузере — обычный `<input type="file">`.
- **CSV** сохраняется через `save` + Rust-команду `save_text_file` в Tauri, через `showSaveFilePicker` в поддерживающих браузерах, иначе — обычным скачиванием.
- **Стили** — styled-components + токены из `shared/styles/tokens.ts`; глобальные стили в `shared/styles/global.ts`.
- **Алиас** `@` → `frontend/src` настроен в `vite.config.ts` и `tsconfig.app.json`.

---

## Проверки качества кода

### Backend

```bash
cd backend

py -m ruff check .
py -m ruff format --check .
py -m mypy .
```

Текущее состояние: все три команды проходят без ошибок (67 файлов). Конфигурации `pyproject.toml`/`mypy.ini` нет — используются настройки по умолчанию. `pyproject.toml` добавлен в `.gitignore`, поэтому при добавлении конфигурации линтеров его нужно исключить из игнора или переименовать.

### Frontend

```bash
cd frontend

npm run lint          # ESLint
npx tsc -b --pretty false
npm run build         # tsc -b && vite build
```

Текущее состояние: ESLint и TypeScript проходят без ошибок. Сборка выдаёт предупреждение Vite о чанке > 500 КБ (не ошибка).

### Тесты

Автотестов нет. Для добавления:

- backend — `pytest`, `httpx`/`TestClient`, временная SQLite и временная папка хранилища;
- frontend — `vitest` + `@testing-library/react`.

---

## Известные проблемы и ограничения

1. **PM2 не передаёт порт 8001** — frontend не подключится. Исправление: добавить `--port 8001` в `ecosystem.config.js` или изменить `VITE_API_URL`.
2. **`dev.mjs` использует `py`** — на Linux/macOS замените на `python3`.
3. **Нейросетевая сегментация выбрана, но недоступна** — `AnalysisPipeline.run` бросает `ValueError`, запуск получает статус `FAILED`.
4. **`modelId` должен существовать в `segmentation_models`** — иначе падение на внешнем ключе. Фронтенд подставляет `toolId` или `default_model`; маршрут `/workspace/temp-id` приведёт к ошибке.
5. **Таблицы `objects`/`pores` пусты** — история и метрики строятся по агрегатам и `size_distribution`, а не по нормализованным таблицам.
6. **Метрики `PERIMETER`, `CIRCULARITY`, `FORM_FACTOR` — заглушки** (нули/пустые массивы).
7. **Разделение/объединение пор и классификация** принимаются в запросе/настройках, но не влияют на результат.
8. **Масштаб** — только глобальный `feature_extraction.scale_mm_per_pixel`; `images.scale_value` всегда `1.0`.
9. **CORS открыт для всех источников**, аутентификации нет — приложение рассчитано на локальный запуск.
10. **Tauri `identifier` = `com.tauri.dev`**, `csp: null` — перед релизом нужно заменить.
11. **`GET /settings/raw` фактически совпадает с `settings` из envelope**, отдельного «плоского» формата нет.
12. **История не пагинируется** — возвращаются все запуски.
13. **Удаление изображения** как отдельная операция отсутствует; изображения удаляются только вместе с хранилищем/историей.
14. **Ошибки на фронтенде часто показываются через `alert`** и `console.error` — UX-долг.
15. **Кодировка документации** — файлы `README.md` и `docs/*.md` сохранены в UTF-8. При редактировании в старых редакторах сохраняйте UTF-8, иначе русский текст превратится в нечитаемые символы.

---

## Где что менять

Ниже — карта «задача → файлы». Полный план с приоритетами — [docs/TODO.md](docs/TODO.md).

| Что нужно сделать | Где менять |
|---|---|
| Заменить `MockDetector` на реальную модель/алгоритм | `backend/app/modules/object_detection/mock_detector.py`, реализовать `DetectorInterface`; подключение — `backend/app/pipeline/analysis_pipeline.py:19` |
| Добавить нейросетевую сегментацию | `backend/app/pipeline/analysis_pipeline.py:48-58`, новый модуль в `backend/app/modules/segmentation/`, параметры `NeuralSegmentationParameters` в `entities/processing_parameters.py`, настройки `segmentation.neural` |
| Реализовать разделение слипшихся пор | новый модуль `backend/app/modules/pore_separation/`, вызов в пайплайне, `SeparationParameters`, `settings.pore_separation`, запись в `pores` |
| Реализовать классификацию объектов | новый модуль, `settings.object_classification`, `objects.object_type/processing_status`, вызов до/после разделения |
| Заполнять `objects` и `pores` | `backend/app/services/analysis.py:106-112` (TODO), `AnalysisRepository`, `MaskRepository` |
| Считать `PERIMETER`, `CIRCULARITY`, `FORM_FACTOR` | `backend/app/modules/feature_extraction/feature_extractor.py`, `backend/app/services/metrics.py` (`build_metrics`) |
| Добавить per-image масштаб | `backend/app/services/image_upload.py:143-148`, `images.scale_value`, `FeatureExtractor.extract`, API загрузки |
| Реализовать обучение модели | новые роутер/сервис/репозиторий; `settings.training`; `segmentation_models`; frontend `pages/create-ai`, `training-process`, `training-result` |
| Создание/обновление моделей | `backend/app/database/repositories/tool_repository.py` (TODO), `api/routers/tools.py` |
| Прогресс обучения в реальном времени | WebSocket/SSE-эндпоинт; заменить `setInterval` в `TrainingProcessPage.tsx` |
| Заменить тестовые данные результата обучения | `TrainingResultPage.tsx` (`TEST_IMAGES`, метрики, график), API обучения |
| Изменить состав/логику кэша | `backend/app/utils/run_hash.py` (`HASH_VERSION`), `backend/app/services/analysis.py` |
| Изменить сохраняемые артефакты | `backend/app/services/analysis.py::_saved_image_names`, `settings.analysis_pipeline` |
| Изменить правила валидации настроек | `backend/app/schemas/settings_schema.py`, `backend/app/config/settings_service.py` |
| Изменить стартовые значения настроек | `backend/app/config/default_settings.py` + `settings.json` |
| Изменить UI-настройки обработки | `frontend/src/widgets/processing-settings`, `frontend/src/entities/workspace/model/types.ts` |
| Изменить метрики/графики | `frontend/src/widgets/metrics-distribution`, `widgets/pore-metrics`, `widgets/metrics-settings-used` |
| Изменить маршруты | `frontend/src/app/router/AppRouter.tsx` |
| Изменить адрес API | `frontend/.env`, fallback в `frontend/src/shared/api/client.ts` |
| Исправить PM2-порт | `ecosystem.config.js` (`args: "main:app --reload --port 8001"`) |
| Поправить Tauri-метаданные | `frontend/src-tauri/tauri.conf.json` (`identifier`, `csp`) |

---

## Документация

- [docs/API.md](docs/API.md) — все эндпоинты, схемы запросов/ответов, коды ошибок, примеры `curl`.
- [docs/SETTINGS.md](docs/SETTINGS.md) — полный справочник `settings.json`, какие поля реально используются.
- [docs/TODO.md](docs/TODO.md) — заглушки, технический долг и пошаговые рекомендации по реализации.

---

## Лицензия

Файл лицензии в репозитории отсутствует. До публикации или передачи проекта нужно добавить лицензию и уточнить права на использование.
