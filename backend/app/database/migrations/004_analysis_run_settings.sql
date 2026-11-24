-- Снимок настроек, которые повлияли на запуск анализа.
-- Хранится JSON-строкой, чтобы страница результатов показывала значения
-- на момент запуска, даже если settings.json изменился позже.
ALTER TABLE analysis_runs ADD COLUMN settings_snapshot TEXT;
