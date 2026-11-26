# TODO и точки расширения

Документ фиксирует всё, что в проекте является заглушкой, упрощением или техническим долгом. Для каждой задачи указано, где менять код и что именно нужно сделать.

Приоритеты:

- **P0** — без этого проект не выполняет заявленную функцию (нейросеть, разделение пор, обучение).
- **P1** — заметно влияет на корректность/удобство, стоит делать следующим.
- **P2** — качество, надёжность, UX, инфраструктура.
- **P3** — косметика и долгосрочные улучшения.

---

## Сводная таблица

| # | Задача | Приоритет | Основные файлы |
|---|---|---|---|
| 1 | Заменить `MockDetector` реальным детектором/моделью | P0 | `backend/app/modules/object_detection/` |
| 2 | Реализовать нейросетевую сегментацию | P0 | `backend/app/modules/segmentation/`, `pipeline/analysis_pipeline.py` |
| 3 | Реализовать разделение слипшихся пор | P0 | новый модуль `pore_separation`, `pipeline` |
| 4 | Реализовать классификацию объектов | P0 | новый модуль, `settings.object_classification` |
| 5 | Заполнять таблицы `objects` и `pores` | P1 | `services/analysis.py`, репозитории |
| 6 | Достроить метрики (perimeter/circularity/form factor) | P1 | `feature_extractor.py`, `services/metrics.py` |
| 7 | Использовать флаги `feature_extraction` | P1 | `feature_extractor.py` |
| 8 | Персональный масштаб изображения | P1 | `services/image_upload.py`, `images.scale_value` |
| 9 | Backend обучения и регистрации моделей | P0/P1 | новые router/service/repository, `training` |
| 10 | Создание/обновление моделей через API | P1 | `tool_repository.py`, `api/routers/tools.py` |
| 11 | Прогресс обучения в реальном времени | P1 | WebSocket/SSE, `TrainingProcessPage.tsx` |
| 12 | Реальные данные на странице результатов обучения | P1 | `TrainingResultPage.tsx`, API обучения |
| 13 | Заменить `temp-id` после создания модели | P1 | `CreateAiPage.tsx` |
| 14 | Применение настроек из истории | P2 | `VisualizeMetricsPage.tsx`, workspace store |
| 15 | Пагинация истории и изображений | P2 | API + frontend |
| 16 | Удаление отдельных изображений | P2 | API + repository + UI |
| 17 | Тесты backend/frontend | P1 | `backend/tests`, `frontend/src/**/*.test.tsx` |
| 18 | Улучшить обработку ошибок на frontend | P2 | заменить `alert`, добавить error boundary |
| 19 | Инфраструктура запуска (PM2, cross-platform) | P2 | `ecosystem.config.js`, `dev.mjs` |
| 20 | Безопасность (CORS, upload/path, Tauri CSP) | P1 | `main.py`, `uploads.py`, `tauri.conf.json` |
| 21 | Надёжность SQLite | P2 | `connection.py`, репозитории |
| 22 | Логирование и ротация | P2 | `main.py`, logging config |
| 23 | Валидация размеров изображений | P2 | `settings.image.allowed_sizes` |
| 24 | Ревизия неиспользуемых настроек | P2 | `settings_schema.py`, `default_settings.py` |
| 25 | Документация и лицензия | P2 | `README.md`, `docs/`, `LICENSE` |

---

## 1. Заменить `MockDetector` реальным детектором (P0)

**Сейчас:** `backend/app/modules/object_detection/mock_detector.py` — это не ML-модель, а классический алгоритм: `skimage.measure.label` + `regionprops`. Он ищет связные области на инвертированной маске и считает площадь, периметр, центроид, bounding box, roundness.

**Почему это заглушка:** имя и документация прямо говорят «заглушка вместо нейросети». Для реальных пористых материалов слипшиеся поры, шум и неоднородная яркость требуют либо ML-сегментации, либо более сложного classical pipeline.

**Что сделать:**

1. Создать новую реализацию `DetectorInterface` (`backend/app/modules/object_detection/detector_interface.py`):
   - вход: бинарная маска `np.ndarray`;
   - выход: `list[PoreObject]`;
   - сохранить контракт `detect(mask) -> list[PoreObject]`.
2. Подключить её в `AnalysisPipeline.__init__` (`backend/app/pipeline/analysis_pipeline.py:19`) вместо `MockDetector`.
3. Если детектор использует ML-модель:
   - добавить путь к весам в `settings.segmentation.neural.selected_model` или отдельную секцию;
   - учесть `device`, `default_confidence_threshold`, `entities`;
   - кэшировать загруженную модель, а не читать веса на каждый запуск.
4. Если нужен выбор между classical и neural — добавить фабрику/стратегию и настройку `object_detection.detector` (новое поле + схема + UI-подпись).
5. При изменении логики обработки увеличить `HASH_VERSION` в `backend/app/utils/run_hash.py`, иначе старые кэшированные результаты будут считаться актуальными.
6. Добавить тесты на синтетических масках: одна пора, две слипшиеся, шум, пустая маска.

**Важно:** в маске `True` — материал, поры — `False`. `MockDetector` инвертирует маску. Новая реализация должна либо соблюдать это соглашение, либо явно документировать своё.

---

## 2. Нейросетевая сегментация (P0)

**Сейчас:** `AnalysisPipeline.run` при `segmentation.method == "neural"` бросает:

```python
ValueError("Нейросетевая сегментация недоступна: модуль инференса не подключён")
```

Параметры `segmentation.neural.*` и `AnalyzeRequest.segmentation.neural.*` валидируются и сохраняются, но не используются.

**Что сделать:**

1. Создать модуль, например `backend/app/modules/segmentation/neural_segmenter.py`:
   - интерфейс `segment(image, parameters) -> np.ndarray` (bool-маска);
   - загрузка модели по `model_id`/`model_path` из `segmentation_models`;
   - поддержка `entities` (какие классы/сущности искать) и `default_confidence_threshold`;
   - `device` (`cpu`/`cuda`/`mps`).
2. В `AnalysisPipeline` заменить `raise ValueError` на выбор сегментера:
   ```python
   if method == "neural":
       mask = self.neural_segmenter.segment(preprocessed_image, neural_params)
   else:
       mask = self.threshold_segmenter.segment(preprocessed_image, threshold_params)
   ```
3. Привести выход к тому же соглашению: `True` — материал, `False` — поры.
4. Учесть `output.foreground_value`/`background_value` — они применяются позже, при сохранении маски.
5. Добавить обработку ошибок: модель не найдена, веса повреждены, неподдерживаемое устройство → понятная ошибка в истории (`FAILED` + `error_message`).
6. Обновить `HASH_VERSION`, потому что результаты для тех же параметров изменятся.

**Зависимости:** сейчас в `requirements.txt` нет ML-фреймворка. Нужно выбрать (PyTorch/ONNX Runtime/OpenVINO) и добавить зависимости, а также продумать размер поставки Tauri.

---

## 3. Разделение слипшихся пор (P0/P1)

**Сейчас:** `AnalyzeRequest.separation.*` и `settings.pore_separation.*` полностью принимаются, валидируются и попадают в снимок параметров, но пайплайн их не читает. В `AnalyzeRequest` есть `algorithmParams` (свободный объект), который нигде не используется.

**Что сделать:**

1. Создать `backend/app/modules/pore_separation/separator.py`:
   - вход: `postprocessed_mask`, список `PoreObject`, `SeparationParameters`;
   - выход: обновлённый список объектов/пор с признаком `pore_type` (`autonomous`/`separated`/`not_separated`), `parent_object_id`;
   - алгоритмы-кандидаты: watershed по distance transform, erosion + label, Hough/ellipse fitting, ML-инстанс-сегментация.
2. Вызвать шаг в `AnalysisPipeline` после детекции и до извлечения признаков (или после классификации — см. п. 4).
3. Реализовать флаги:
   - `enabled`;
   - `apply_only_to_candidates`;
   - `preserve_autonomous_pores`;
   - `keep_unseparated_candidates`;
   - `validate_separation_result`;
   - `preserve_parent_link`;
   - `evaluate_separation_quality` + `quality_metrics.*` (covered/lost/extra area, coverage/extra ratio).
4. Записывать результат в `pores` (см. п. 5).
5. Учитывать `analysis_pipeline.save_separation_result` (сейчас флаг не используется).
6. Добавить эталонные тесты: две соприкасающиеся окружности должны разделиться на две поры; одиночная — остаться автономной.

**Где менять:** `backend/app/pipeline/analysis_pipeline.py`, `backend/app/entities/processing_parameters.py`, `backend/app/config/default_settings.py`, `backend/app/schemas/analyze_request.py` (если нужны новые поля), `backend/app/services/analysis.py`.

---

## 4. Классификация объектов (P0/P1)

**Сейчас:** `settings.object_classification` (режим, правила кандидатности, используемые признаки) не используется. `objects.object_type` и `processing_status` в БД есть, но строки не создаются.

**Что сделать:**

1. Модуль `backend/app/modules/object_classification/classifier.py`:
   - вход: `PoreObject[]`, настройки `object_classification`;
   - выход: у каждого объекта `object_type` (`autonomous`/`candidate`) и `processing_status` (`classified`/`processed`).
2. Реализовать правила `candidate_rules`: `max_area`, `min_roundness`, `max_eccentricity`, `min_solidity`, `min_extent`.
3. Учесть `features.use_*`: какие метрики реально участвуют в решении.
4. Вызвать до разделения пор, чтобы `separation.apply_only_to_candidates` имел смысл.
5. Сохранять результаты в `objects` и использовать в `pore_merging`.
6. Добавить в `FeatureExtractor`/метрики разбивку по статусам (`summary_statistics.count_by_status`).

---

## 5. Заполнять `objects` и `pores` (P1)

**Сейчас:** в `backend/app/services/analysis.py` есть явный TODO:

```python
# TODO(objects, pores): таблицы objects и pores пока не
# заполняются. ...
```

Таблицы созданы миграцией `001_initial.sql`, но `INSERT` в них нигде нет. История и метрики строятся по `analysis_results` и `size_distribution`.

**Что сделать:**

1. Создать `ObjectRepository` и `PoreRepository` (или методы в `AnalysisRepository`).
2. После успешного пайплайна сохранять:
   - `objects`: `object_id`, `run_id`, `mask_id`, `object_type`, `processing_status`;
   - `pores`: `pore_id`, `run_id`, `source_object_id`, `parent_object_id`, `pore_type`, `centroid_x`, `centroid_y`.
3. Связать `objects.mask_id` с соответствующей маской (`segmentation`→`raw` или `postprocessed`→`cleaned`).
4. Обновить `GET /analysis/{run_id}/metrics`, чтобы таблица пор и статистика могли читаться из нормализованных таблиц, а не только из JSON.
5. Учесть каскадное удаление при `DELETE /history/{run_id}` (уже настроено через внешние ключи, но проверить).
6. Добавить миграцию индексов (`analysis_runs(image_id)`, `pores(run_id)`, `objects(run_id)`).

**Важно:** `analysis_runs.model_id` — внешний ключ на `segmentation_models`. Если добавляете тестовые/временные модели, сначала создавайте строку в `segmentation_models`.

---

## 6. Достроить метрики (P1)

**Сейчас:** `backend/app/services/metrics.py::build_metrics` возвращает:

- `PORE_SIZE` — по диаметрам;
- `AREA` — по площадям;
- `PERIMETER`, `CIRCULARITY`, `FORM_FACTOR` — пустые массивы и нулевая статистика.

`FeatureExtractor` уже получает `perimeter` и `roundness` у `PoreObject`, но не сохраняет их в `size_distribution`.

**Что сделать:**

1. В `FeatureExtractor.extract` добавить в `pore_rows` и/или отдельные массивы:
   - `perimeter`;
   - `circularity` (например, `4π·area / perimeter²`, ограничить `[0,1]`);
   - `form_factor` (определиться с формулой и задокументировать).
2. Сохранить массивы в `size_distribution` (JSON) с ключами `perimeters`, `circularities`, `form_factors`.
3. В `build_metrics` заполнить `points(...)` и `describe(...)` для соответствующих типов.
4. Обновить `ProcessingMetrics` на frontend (типы уже есть) и `DISTRIBUTION_META` в `frontend/src/widgets/metrics-distribution/model/distributionMeta.ts`.
5. Для старых запусков оставить fallback (пустые значения), не ломать страницу.
6. Увеличить `HASH_VERSION`.

---

## 7. Использовать флаги `feature_extraction` (P1/P2)

**Сейчас:** реально используются только `use_scale` и `scale_mm_per_pixel`. Остальные флаги (`calculate_object_features`, `calculate_summary_statistics`, `region_object_features.*`, `circle_object_features.*`, `summary_statistics.*`, `preserve_*`, `include_separation_quality_metrics`, `use_status_based_feature_source`) ни на что не влияют.

**Что сделать:**

- либо реализовать их (выборочный расчёт характеристик и статистики),
- либо убрать из схемы/UI, чтобы не создавать ложное впечатление управляемости.

Рекомендуется реализовать постепенно:

1. `calculate_summary_statistics` + `summary_statistics.*` — управлять набором агрегатов в `AnalysisResult`.
2. `region_object_features.*`/`circle_object_features.*` — выбирать, какие признаки попадают в таблицу/метрики.
3. `preserve_object_status`/`preserve_parent_object_id` — включать соответствующие поля в экспорт и `pores`.
4. `include_separation_quality_metrics` — добавлять метрики качества разделения.

---

## 8. Персональный масштаб изображения (P1)

**Сейчас:** в `backend/app/services/image_upload.py` есть TODO:

```python
# TODO(images.scale_value): масштаб конкретного изображения
# пока не задаётся, поэтому всегда 1.0.
```

`images.scale_value` пишется как `1.0`; `FeatureExtractor` использует только глобальный `feature_extraction.scale_mm_per_pixel`.

**Что сделать:**

1. Добавить в API загрузки необязательное поле `scale_value` (или `scaleMmPerPixel`) для `POST /upload/path` и `POST /upload`.
2. Передавать его в `ImageModel.scale_value`.
3. В `FeatureExtractor` выбирать масштаб: per-image → глобальный → `None`.
4. Отдавать масштаб в `GET /images/{id}` и показывать в UI.
5. Добавить миграцию, если понадобится единица измерения или калибровочные точки.
6. Обновить `HASH_VERSION`, так как масштаб влияет на результат (сейчас он не входит в хэш; при появлении per-image масштаба его нужно включить в факторы).

---

## 9. Backend обучения и регистрации моделей (P0/P1)

**Сейчас:** раздел `settings.training` помечен TODO и не используется backend. Frontend-страницы создания/обучения/результата — имитация:

- `CreateAiPage` собирает имя, описание, эпохи, batch, learning rate и пары файлов, но никуда не отправляет; переход идёт на `/neural-networks/temp-id/training`.
- `TrainingProcessPage` генерирует прогресс через `setInterval` и случайные числа.
- `TrainingResultPage` использует `TEST_IMAGES` и захардкоженные метрики/график.

**Что сделать:**

1. Модель задания обучения в БД: `training_jobs` (id, status, progress, params, dataset, created_at, error).
2. API:
   - `POST /training` — создать задание (метаданные + параметры + датасет);
   - `GET /training/{id}` — статус/прогресс/метрики;
   - `POST /training/{id}/cancel`;
   - `GET /training/{id}/events` (SSE) или WebSocket;
   - `POST /training/{id}/save` — зарегистрировать модель в `segmentation_models`;
   - `DELETE /training/{id}` — удалить временную модель.
3. Загрузка датасета: либо multipart с архивом, либо пути к папкам (как `/upload/path`). Валидировать пары «изображение + маска» (размер, форматы, бинарность).
4. Фоновый worker (поток/процесс/Celery/RQ) — обучение не должно блокировать FastAPI.
5. Сохранение весов в `settings.training.model_registry.models_directory`, запись в `segmentation_models` (`model_type="neural_network"`, `removable=true`).
6. Метрики Dice/IoU/pixel accuracy — считать на валидации и сохранять.
7. Обновить frontend: убрать `temp-id`, `setInterval`, `TEST_IMAGES`; подключить API и реальный прогресс.
8. Учесть `TrainingSettings`: форматы, `validate_image_mask_size`, параметры, `save_model_file`, `register_model_in_config`.

**Файлы:** новые `app/api/routers/training.py`, `app/services/training.py`, `app/database/repositories/training_repository.py`, `app/modules/training/`; frontend `pages/create-ai`, `pages/training-process`, `pages/training-result`, `entities/training`.

---

## 10. Создание/обновление моделей через API (P1)

**Сейчас:** в `backend/app/database/repositories/tool_repository.py` есть TODO:

```python
# TODO(segmentation_models): создание и обновление моделей пока не реализованы.
```

Есть только `get_all`, `get_by_id`, `delete`.

**Что сделать:**

1. Добавить `create(model)` и `update(model_id, ...)`.
2. Добавить эндпоинты:
   - `POST /tools` — зарегистрировать модель (метаданные + путь/файл);
   - `PATCH /tools/{id}` — переименовать/обновить;
   - валидировать `model_type`, `removable`, существование `model_path`.
3. Связать с обучением (п. 9) и с выбором модели в workspace.
4. Продумать защиту встроенной `default_model` (`removable=false`).

---

## 11. Прогресс обучения в реальном времени (P1)

**Сейчас:** в `TrainingProcessPage.tsx`:

```typescript
// имитация обучения ( TODO: заменить на websocket)
```

**Что сделать:**

- реализовать SSE (`EventSource`) или WebSocket;
- события: `epoch`, `loss`, `accuracy`, `log`, `completed`, `failed`;
- переподключение и корректное закрытие при размонтировании;
- отмена обучения;
- при завершении — переход на реальные результаты.

---

## 12. Реальные данные на странице результатов обучения (P1)

**Сейчас:** `TrainingResultPage.tsx` содержит `TEST_IMAGES`, захардкоженные `98.43%`, `96.82%`, `97.61%`, `0.021`, «426 пар», «13 мин 48 сек», «18.4 МБ» и сгенерированный график.

**Что сделать:**

1. Загружать результаты по `id` из API.
2. Показывать реальные метрики и график обучения.
3. Реализовать сохранение/удаление модели (`handleSaveModel`, `handleDiscardModel` — сейчас оба ведут на `/`).
4. Показывать реальные примеры сегментации (оригинал/эталон/предсказание).
5. Убрать `public/test/*`, если они больше не нужны.

---

## 13. Заменить `temp-id` (P1)

**Сейчас:** в `CreateAiPage.tsx`:

```typescript
// TODO: заменить temp-id на id, который вернёт backend после создания модели.
navigate("/neural-networks/temp-id/training");
```

**Что сделать:** после `POST /training` (или `POST /tools`) использовать реальный id. Пока backend нет — можно генерировать UUID локально, но это не заменяет серверную регистрацию.

---

## 14. Применение настроек из истории (P2)

**Сейчас:** в `VisualizeMetricsPage.tsx`:

```typescript
// TODO(training): если переход идет через страницу истории, то нужно дать
// возможность применить и поменять локальные настройки для выбранной обработки
```

Переход «Изменить настройки» возвращает назад по истории браузера; если страница открыта по прямой ссылке — на `/`. Настройки из `settingsUsed` не применяются к workspace.

**Что сделать:**

1. Добавить действие «Повторить с этими настройками»: взять `settingsUsed.request` + `global` и заполнить `processingSettings`.
2. Выбрать/создать workspace для нужного `toolId`.
3. Учесть, что часть настроек глобальная (`postprocessing`, `object_detection`, `feature_extraction`) — либо применить их временно, либо показать, что они берутся из текущего `settings.json`.
4. Обработать прямой переход по ссылке: вести на `/` или на `/workspace/default_model` с сообщением.

---

## 15. Пагинация истории и изображений (P2)

**Сейчас:** `GET /history` и `GET /images` возвращают все записи.

**Что сделать:** добавить `limit`/`offset` (или cursor), сортировку на стороне сервера, счётчик; на frontend — бесконечную прокрутку или страницы. Для истории полезно фильтровать по статусу/дате на сервере.

---

## 16. Удаление отдельных изображений (P2)

**Сейчас:** удалить изображение можно только вместе с хранилищем (`delete_history=true`) или через удаление запусков. Отдельного `DELETE /images/{id}` нет.

**Что сделать:**

1. `DELETE /images/{id}` с каскадным удалением запусков, масок и файлов.
2. Подтверждение (как у моделей) или отдельный диалог.
3. Обновить UI списка изображений (сейчас отдельной страницы нет).

---

## 17. Тесты (P1)

**Сейчас:** тестов нет.

**Backend:**

- `pytest` + `fastapi.testclient.TestClient`;
- фикстуры: временная папка `tmp_path`, временная SQLite, `ImageStorage(base_dir=...)`, `APP_SETTINGS` с тестовыми значениями;
- покрыть: загрузку/дедупликацию, hash/кэш, пороговую сегментацию, постобработку, `MockDetector`, `FeatureExtractor`, метрики, CSV, миграции, реестр хранилищ, ошибки API.

**Frontend:**

- `vitest` + `@testing-library/react`;
- покрыть: `workspaceStore`, `createRunFingerprint`, `groupDistribution`, `sortPores`, `validateMask`, `settingsJson`, форматирование CSV/чисел, страницы с моками axios.

**E2E (опционально):** Playwright — сценарий «загрузить → обработать → метрики → CSV».

---

## 18. Обработка ошибок на frontend (P2)

**Сейчас:** в нескольких местах используется `alert()` и `console.error()`:

- `LandingPage` — удаление модели;
- `WorkspacePage` — ошибка обработки;
- `HistoryPage` — удаление записи;
- `useWorkspaceUpload` — ошибка загрузки;
- `useDatasetPairs` — неверный формат/размер маски.

**Что сделать:**

1. Единый компонент уведомлений/toast.
2. Показывать `detail` от backend, а не общий текст.
3. Error boundary на уровне приложения.
4. Различать отмену пользователем и реальную ошибку (сейчас в загрузке Tauri отмена просто игнорируется — это ок, но стоит явно обрабатывать).
5. Состояния загрузки/пустых данных везде, где сейчас только `alert`.

---

## 19. Инфраструктура запуска (P2)

1. **PM2:** `ecosystem.config.js` запускает backend без `--port 8001`. Исправить:
   ```javascript
   args: "main:app --reload --port 8001"
   ```
   Либо синхронизировать `VITE_API_URL`.
2. **`dev.mjs`:** жёстко использует `py`. Сделать выбор интерпретатора по платформе (`process.platform === "win32" ? "py" : "python3"`) или переменную окружения.
3. **Проверка готовности:** используется `/docs`; лучше `/health` (легче и не зависит от Swagger UI).
4. **Порт frontend:** Tauri ждёт `http://localhost:5173`; при занятом порте Vite выберет другой — стоит зафиксировать `server.port` и `strictPort`.
5. **Корневой `package.json`:** нет `engines`, нет зависимостей; можно добавить скрипты `lint`, `check`, `build`.

---

## 20. Безопасность (P1)

Проект рассчитан на локальный запуск, но перед публикацией/многопользовательским режимом нужно:

1. **CORS** — сузить `allow_origins` до dev/prod-адресов (`main.py`).
2. **`POST /upload/path`** — сейчас принимает любой абсолютный путь и читает файл. Ограничить разрешёнными корнями или оставить только для loopback.
3. **Аутентификация** — если появится сетевой режим.
4. **Tauri CSP** — `csp: null`; задать политику.
5. **Tauri identifier** — заменить `com.tauri.dev`.
6. **`save_text_file`** — Rust-команда пишет по любому пути, переданному из webview. Валидировать путь/расширение или использовать dialog scope.
7. **Path traversal** — в `ImageStorage` уже есть `_SAFE_NAME` и проверка корней; при добавлении новых эндпоинтов сохранять этот подход.
8. **Ограничение размера загрузки** — сейчас нет лимита; добавить max size и проверку `Content-Length`.
9. **Секреты/логи** — не логировать абсолютные пользовательские пути без необходимости.

---

## 21. Надёжность SQLite (P2)

**Сейчас:**

- одно соединение `sqlite3.connect(..., check_same_thread=False)` на приложение;
- миграции и репозитории используют его из потоков FastAPI (sync-эндпоинты выполняются в threadpool);
- нет WAL, busy timeout, retry.

**Что сделать:**

1. Включить `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=NORMAL`, `PRAGMA busy_timeout`.
2. Рассмотреть connection-per-request или пул, либо явную блокировку на запись.
3. Добавить индексы под частые запросы (см. п. 5).
4. Проверить поведение при параллельных одинаковых анализах (сейчас есть обработка `IntegrityError`, но стоит покрыть тестом).
5. Добавить резервное копирование/вакуум (опционально).

---

## 22. Логирование и ротация (P2)

**Сейчас:** `logging.basicConfig(filename=backend/app.log)`, уровень INFO; middleware пишет `/health` на DEBUG (в файл не попадёт при INFO). Ротации нет — файл растёт.

**Что сделать:**

1. `RotatingFileHandler` или `TimedRotatingFileHandler`.
2. Настраиваемый уровень через env (`LOG_LEVEL`).
3. Не логировать health-запросы на INFO (сейчас DEBUG — ок).
4. Добавить request-id/корреляцию для анализа.
5. Убедиться, что логи не конфликтуют с PM2 (root `app.log`).

---

## 23. Валидация размеров изображений (P2)

**Сейчас:** `image.allowed_sizes` участвует только в проверке `default_size` при `resize_on_load=true`. Загрузка изображения любого размера разрешена.

**Что сделать:** решить, нужно ли ограничение. Если да — проверять `(width,height)` после декодирования и возвращать `400` с понятным сообщением; либо автоматически ресайзить до ближайшего допустимого размера. Обновить UI-подсказки.

---

## 24. Ревизия неиспользуемых настроек (P2)

Многие поля существуют, но не влияют ни на что (см. [SETTINGS.md](SETTINGS.md)):

- `object_classification.*`;
- `pore_separation.*` (кроме сохранения в снимок);
- `pore_merging.*`;
- большая часть `feature_extraction.*`;
- `analysis_pipeline.save_classification_result`, `save_separation_result`, `save_features`;
- `training.*` на backend.

**Что сделать:** либо реализовать, либо скрыть/пометить в UI как «зарезервировано», чтобы пользователь не думал, что настройка работает. В идеале — добавить в редактор бейдж «не используется» для таких полей.

---

## 25. Документация и лицензия (P2)

1. Поддерживать `README.md`, `docs/API.md`, `docs/SETTINGS.md`, `docs/TODO.md` в актуальном состоянии при изменении API/настроек/пайплайна.
2. Добавить `LICENSE` и определиться с правами.
3. Добавить `CONTRIBUTING.md` с командами проверок и стилем кода (если проект будет командным).
4. Добавить `CHANGELOG.md` при появлении версий.
5. Зафиксировать версии Python/Node (`.python-version`, `engines`, `packageManager`).
6. Добавить `pyproject.toml` с конфигурацией ruff/mypy (сейчас он в `.gitignore` — это нужно исправить, иначе настройки линтеров не коммитятся).

---

## Чек-лист перед релизом

- [ ] Нейросетевая сегментация работает и покрыта тестами.
- [ ] Разделение/объединение пор и классификация реализованы.
- [ ] `objects`/`pores` заполняются, метрики читаются из них.
- [ ] Обучение модели: создание задания, прогресс, сохранение, регистрация.
- [ ] `temp-id`, `TEST_IMAGES`, `setInterval` удалены.
- [ ] Тесты backend/frontend проходят в CI.
- [ ] PM2/`dev.mjs` запускают проект на 8001 без ручных правок.
- [ ] CORS сужен, Tauri CSP/identifier настроены, `upload/path` ограничен.
- [ ] Логи с ротацией, SQLite в WAL.
- [ ] README/API/SETTINGS актуальны, есть LICENSE.
- [ ] `HASH_VERSION` увеличен при изменении логики обработки.
