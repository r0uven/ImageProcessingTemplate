import json

from app.database.models import AnalysisRunModel
from app.database.repositories.processing_parameters_repository import (
    ProcessingParametersRepository,
)
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest


class AnalysisRepository:
    def __init__(self, db):
        self.db = db

    def create_analysis_result(
        self,
        analysis_result_id: str,
        pore_count: int,
        porosity: float,
        area: float,
        diameter: float,
        size_distribution: dict,
    ) -> None:
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
                analysis_result_id,
                pore_count,
                porosity,
                area,
                diameter,
                json.dumps(size_distribution),
            ),
        )
        self.db.commit()

    def create_run(
        self,
        run: AnalysisRunModel,
        parameters: AnalyzeRequest,
    ) -> None:
        processing_parameters = to_processing_parameters(parameters)
        ProcessingParametersRepository(self.db).create(
            params=processing_parameters,
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

        self.db.commit()

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
        # delete masks/objects/pores cascade via FK
        cursor = self.db.execute(
            "DELETE FROM analysis_runs WHERE run_id = ?",
            (run_id,),
        )
        self.db.commit()
        return cursor.rowcount > 0
