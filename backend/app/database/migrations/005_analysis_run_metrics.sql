-- Длительность выполнения анализа (секунды) и итоговый статус запуска.
-- Раньше история показывала заглушки: duration всегда 0.0, status всегда
-- SUCCESS. Теперь значения сохраняются вместе с запуском.
ALTER TABLE analysis_runs ADD COLUMN duration REAL NOT NULL DEFAULT 0;

ALTER TABLE analysis_runs ADD COLUMN status TEXT NOT NULL DEFAULT 'SUCCESS'
    CHECK (status IN ('SUCCESS', 'FAILED'));
