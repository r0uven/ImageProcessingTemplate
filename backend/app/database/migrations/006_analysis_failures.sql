-- Неудачный запуск анализа не имеет analysis_results и processing_parameters,
-- поэтому ссылки на них должны допускать NULL. Заодно сохраняем текст ошибки.
--
-- SQLite не умеет менять NOT NULL у существующей колонки, поэтому таблица
-- пересоздаётся с переносом данных.
CREATE TABLE analysis_runs_new (
    run_id TEXT PRIMARY KEY,

    image_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    params_id TEXT,
    analysis_result_id TEXT,

    created_at INTEGER NOT NULL,

    settings_snapshot TEXT,
    duration REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SUCCESS'
        CHECK (status IN ('SUCCESS', 'FAILED')),
    error_message TEXT,

    FOREIGN KEY(image_id)
        REFERENCES images(image_id),

    FOREIGN KEY(model_id)
        REFERENCES segmentation_models(model_id),

    FOREIGN KEY(params_id)
        REFERENCES processing_parameters(params_id),

    FOREIGN KEY(analysis_result_id)
        REFERENCES analysis_results(analysis_result_id)
);

INSERT INTO analysis_runs_new (
    run_id,
    image_id,
    model_id,
    params_id,
    analysis_result_id,
    created_at,
    settings_snapshot,
    duration,
    status,
    error_message
)
SELECT
    run_id,
    image_id,
    model_id,
    params_id,
    analysis_result_id,
    created_at,
    settings_snapshot,
    duration,
    status,
    NULL
FROM analysis_runs;

DROP TABLE analysis_runs;

ALTER TABLE analysis_runs_new RENAME TO analysis_runs;
