import json
import sqlite3
from dataclasses import asdict

from app.entities.processing_parameters import (
    NeuralSegmentationParameters,
    OutputMaskParameters,
    PreprocessingParameters,
    ProcessingParameters,
    QualityMetricsParameters,
    SegmentationParameters,
    SeparationParameters,
    ThresholdSegmentationParameters,
)


class ProcessingParametersRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create(self, params: ProcessingParameters) -> None:
        self.connection.execute(
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
                params.parameters_id,
                json.dumps(asdict(params.preprocessing)),
                json.dumps(asdict(params.segmentation)),
                json.dumps(asdict(params.separation)),
            ),
        )

        self.connection.commit()

    def get_all(self) -> list[ProcessingParameters]:
        cursor = self.connection.execute(
            """
            SELECT
                params_id,
                preprocessing_params,
                segmentation_params,
                separation_params
            FROM processing_parameters
            ORDER BY params_id
            """
        )

        rows = cursor.fetchall()

        return [self._row_to_model(row) for row in rows]

    def get_by_id(
        self,
        params_id: str,
    ) -> ProcessingParameters | None:

        cursor = self.connection.execute(
            """
            SELECT
                params_id,
                preprocessing_params,
                segmentation_params,
                separation_params
            FROM processing_parameters
            WHERE params_id = ?
            """,
            (params_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return self._row_to_model(row)

    def delete(self, params_id: str) -> bool:
        cursor = self.connection.execute(
            """
            DELETE FROM processing_parameters
            WHERE params_id = ?
            """,
            (params_id,),
        )

        self.connection.commit()

        return cursor.rowcount > 0

    @staticmethod
    def _row_to_model(row: tuple) -> ProcessingParameters:
        preprocessing_data = json.loads(row[1])
        segmentation_data = json.loads(row[2])
        separation_data = json.loads(row[3])

        return ProcessingParameters(
            parameters_id=row[0],
            preprocessing=PreprocessingParameters(**preprocessing_data),
            segmentation=SegmentationParameters(
                method=segmentation_data["method"],
                output_mask=OutputMaskParameters(**segmentation_data["output_mask"]),
                threshold=ThresholdSegmentationParameters(
                    **segmentation_data["threshold"]
                ),
                neural=NeuralSegmentationParameters(**segmentation_data["neural"]),
            ),
            separation=SeparationParameters(
                enabled=separation_data["enabled"],
                apply_only_to_candidates=separation_data["apply_only_to_candidates"],
                preserve_autonomous_pores=separation_data["preserve_autonomous_pores"],
                keep_unseparated_candidates=separation_data[
                    "keep_unseparated_candidates"
                ],
                validate_separation_result=separation_data[
                    "validate_separation_result"
                ],
                preserve_parent_link=separation_data["preserve_parent_link"],
                evaluate_separation_quality=separation_data[
                    "evaluate_separation_quality"
                ],
                quality_metrics=QualityMetricsParameters(
                    **separation_data["quality_metrics"]
                ),
                algorithm_params=separation_data["algorithm_params"],
            ),
        )
