from datetime import UTC, datetime

from app.database.repositories.processing_parameters_repository import (
    ProcessingParametersRepository,
)
from app.mappers.processing_parameters_mapper import to_processing_parameters
from app.schemas.analyze_request import AnalyzeRequest


class AnalysisRepository:
    def __init__(self, db):
        self.db = db

    def create_run(
        self,
        run_id: str,
        image_id: str,
        model_id: str,
        analysis_result_id: str,
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
                run_id,
                image_id,
                model_id,
                parameters.parametersId,
                analysis_result_id,
                datetime.now(UTC).isoformat(),
            ),
        )

        self.db.commit()

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
                result.size_distribution

            FROM analysis_runs run

            JOIN analysis_results result
                ON result.analysis_result_id = run.analysis_result_id

            WHERE run.run_id = ?
            """,
            (run_id,),
        )

        return cursor.fetchone()
