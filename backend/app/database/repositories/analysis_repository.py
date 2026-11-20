import json
import sqlite3
from dataclasses import asdict

from app.database.models import AnalysisRunModel
from app.entities.analysis_result import AnalysisResult
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest


class AnalysisRepository:
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
                        created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        run.run_id,
                        run.image_id,
                        run.model_id,
                        run.params_id,
                        run.analysis_result_id,
                        run.created_at,
                    ),
                )
        except sqlite3.IntegrityError:
            # Identical requests may finish the CPU-heavy pipeline together.
            # The unique run_id makes one winner; the other can reuse it.
            if self.get_run(run.run_id) is not None:
                return
            raise

    def get_run(self, run_id: str):
        cursor = self.db.execute(
            """
            SELECT
                run.run_id,
                run.image_id,
                run.model_id,
                run.params_id,
                run.created_at,
                run.analysis_result_id,
                img.file_path,
                img.width,
                img.height
            FROM analysis_runs run
            JOIN images img ON img.image_id = run.image_id
            WHERE run.run_id = ?
            """,
            (run_id,),
        )

        return cursor.fetchone()

    def get_analysis_result(self, run_id: str):
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
                img.height
            FROM analysis_runs run

            JOIN analysis_results result
                ON result.analysis_result_id = run.analysis_result_id

            JOIN images img
                ON img.image_id = run.image_id

            WHERE run.run_id = ?
            """,
            (run_id,),
        )

        return cursor.fetchone()

    def get_all_runs(self):
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
                result.pore_count,
                img.original_image_name
            FROM analysis_runs run
            JOIN images img ON img.image_id = run.image_id
            JOIN analysis_results result ON result.analysis_result_id = run.analysis_result_id
            ORDER BY run.created_at DESC
            """
        )
        return cursor.fetchall()

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
        self.db.execute("DELETE FROM analysis_runs WHERE run_id = ?", (run_id,))
        self.db.execute(
            "DELETE FROM analysis_results WHERE analysis_result_id = ?",
            (analysis_result_id,),
        )
        self.db.execute(
            "DELETE FROM processing_parameters WHERE params_id = ?",
            (params_id,),
        )
        self.db.commit()

        return True
