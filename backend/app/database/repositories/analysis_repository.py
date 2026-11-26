"""Репозиторий запусков анализа, их результатов и истории."""

import json
import sqlite3
from dataclasses import asdict

from app.database.models import (
    AnalysisResultRecord,
    AnalysisRunModel,
    HistoryRunRecord,
)
from app.entities.analysis_result import AnalysisResult
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest


class AnalysisRepository:
    """Сохраняет и читает запуски анализа, маски и агрегированные метрики."""

    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def create_analysis(
        self,
        run: AnalysisRunModel,
        parameters: AnalyzeRequest,
        result: AnalysisResult,
    ) -> None:
        processing_parameters = to_processing_parameters(parameters)

        # The three records form one logical analysis. Using the connection
        # context prevents orphaned results when a later insert fails.
        try:
            with self.db:
                # Если этот запуск ранее падал, успешная попытка должна
                # заменить запись о неудаче, а не упасть на PRIMARY KEY.
                self.db.execute(
                    """
                    DELETE FROM analysis_runs
                    WHERE run_id = ? AND status = 'FAILED'
                    """,
                    (run.run_id,),
                )
                self.db.execute(
                    """
                    INSERT INTO processing_parameters (
                        params_id,
                        preprocessing_params,
                        segmentation_params,
                        separation_params
                    )
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        processing_parameters.parameters_id,
                        json.dumps(asdict(processing_parameters.preprocessing)),
                        json.dumps(asdict(processing_parameters.segmentation)),
                        json.dumps(asdict(processing_parameters.separation)),
                    ),
                )
                self.db.execute(
                    """
                    INSERT INTO analysis_results (
                        analysis_result_id,
                        pore_count,
                        porosity,
                        area,
                        diameter,
                        size_distribution
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        result.analysis_result_id,
                        result.pore_count,
                        result.porosity,
                        # The existing schema requires positive aggregate values,
                        # while a valid run may contain zero detected objects.
                        max(result.area, 1e-12),
                        max(result.diameter, 1e-12),
                        json.dumps(result.size_distribution),
                    ),
                )
                self.db.execute(
                    """
                    INSERT INTO analysis_runs (
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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        run.run_id,
                        run.image_id,
                        run.model_id,
                        run.params_id,
                        run.analysis_result_id,
                        run.created_at,
                        run.settings_snapshot,
                        run.duration,
                        run.status,
                        run.error_message,
                    ),
                )
        except sqlite3.IntegrityError:
            # Identical requests may finish the CPU-heavy pipeline together.
            # The unique run_id makes one winner; the other can reuse it.
            if self.run_exists(run.run_id):
                return
            raise

    def run_exists(self, run_id: str) -> bool:
        """Успешный запуск уже сохранён и может быть переиспользован.

        Неудачные попытки намеренно не считаются существующим результатом:
        повторный анализ того же изображения должен попробовать снова.
        """
        cursor = self.db.execute(
            """
            SELECT 1 FROM analysis_runs
            WHERE run_id = ?
              AND status = 'SUCCESS'
              AND analysis_result_id IS NOT NULL
            """,
            (run_id,),
        )
        return cursor.fetchone() is not None

    def record_failure(self, run: AnalysisRunModel) -> None:
        """Сохраняет неудачную попытку анализа.

        У неудачного запуска нет analysis_results и processing_parameters,
        поэтому соответствующие ссылки остаются NULL. Если успешный запуск
        с тем же run_id уже есть, запись о неудаче не перезаписывает его.
        """
        self.db.execute(
            """
            INSERT INTO analysis_runs (
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
            VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, 'FAILED', ?)
            ON CONFLICT(run_id) DO UPDATE SET
                created_at = excluded.created_at,
                settings_snapshot = excluded.settings_snapshot,
                duration = excluded.duration,
                status = 'FAILED',
                error_message = excluded.error_message,
                params_id = NULL,
                analysis_result_id = NULL
            WHERE analysis_runs.status != 'SUCCESS'
            """,
            (
                run.run_id,
                run.image_id,
                run.model_id,
                run.created_at,
                run.settings_snapshot,
                run.duration,
                run.error_message,
            ),
        )
        self.db.commit()

    def get_run_ids_by_image(self, image_id: str) -> list[str]:
        """Возвращает все запуски анализа, привязанные к изображению."""
        cursor = self.db.execute(
            "SELECT run_id FROM analysis_runs WHERE image_id = ?",
            (image_id,),
        )
        return [row[0] for row in cursor.fetchall()]

    def get_analysis_result(self, run_id: str) -> AnalysisResultRecord | None:
        cursor = self.db.execute(
            """
            SELECT
                run.run_id,
                run.image_id,
                run.model_id,
                run.params_id,
                run.created_at,
                result.analysis_result_id,
                result.pore_count,
                result.porosity,
                result.area,
                result.diameter,
                result.size_distribution,
                img.file_path,
                img.width,
                img.height,
                run.settings_snapshot,
                params.preprocessing_params,
                params.segmentation_params,
                params.separation_params
            FROM analysis_runs run
            JOIN analysis_results result
                ON result.analysis_result_id = run.analysis_result_id
            JOIN images img
                ON img.image_id = run.image_id
            LEFT JOIN processing_parameters params
                ON params.params_id = run.params_id
            WHERE run.run_id = ?
            """,
            (run_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return None
        return AnalysisResultRecord(
            run_id=row[0],
            image_id=row[1],
            model_id=row[2],
            params_id=row[3],
            created_at=row[4],
            analysis_result_id=row[5],
            pore_count=row[6],
            porosity=row[7],
            area=row[8],
            diameter=row[9],
            size_distribution=row[10],
            file_path=row[11],
            width=row[12],
            height=row[13],
            settings_snapshot=row[14],
            preprocessing_params=row[15],
            segmentation_params=row[16],
            separation_params=row[17],
        )

    def get_all_runs(self) -> list[HistoryRunRecord]:
        cursor = self.db.execute(
            """
            SELECT
                run.run_id,
                run.image_id,
                run.model_id,
                run.created_at,
                img.file_path,
                img.width,
                img.height,
                COALESCE(result.pore_count, 0),
                img.original_image_name,
                run.duration,
                run.status,
                run.error_message
            FROM analysis_runs run
            JOIN images img ON img.image_id = run.image_id
            LEFT JOIN analysis_results result
                ON result.analysis_result_id = run.analysis_result_id
            ORDER BY run.created_at DESC
            """
        )
        return [
            HistoryRunRecord(
                run_id=row[0],
                image_id=row[1],
                model_id=row[2],
                created_at=row[3],
                file_path=row[4],
                width=row[5],
                height=row[6],
                pore_count=row[7],
                original_image_name=row[8],
                duration=float(row[9] or 0.0),
                status=row[10] or "SUCCESS",
                error_message=row[11],
            )
            for row in cursor.fetchall()
        ]

    def delete_run(self, run_id: str) -> bool:
        cursor = self.db.execute(
            """
            SELECT params_id, analysis_result_id
            FROM analysis_runs
            WHERE run_id = ?
            """,
            (run_id,),
        )
        row = cursor.fetchone()

        if row is None:
            return False

        params_id, analysis_result_id = row

        # Маски, объекты и поры удаляются каскадно через внешние ключи.
        with self.db:
            self.db.execute("DELETE FROM analysis_runs WHERE run_id = ?", (run_id,))

            if analysis_result_id is not None:
                self.db.execute(
                    "DELETE FROM analysis_results WHERE analysis_result_id = ?",
                    (analysis_result_id,),
                )

            if params_id is not None:
                self.db.execute(
                    "DELETE FROM processing_parameters WHERE params_id = ?",
                    (params_id,),
                )

        return True
