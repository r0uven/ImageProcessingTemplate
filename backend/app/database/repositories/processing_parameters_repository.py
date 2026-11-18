import json
import sqlite3
from dataclasses import asdict

from app.entities.processing_parameters import ProcessingParameters
from app.mappers.processing_parameters_mapper import from_processing_parameters_data


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
        return from_processing_parameters_data(
            parameters_id=row[0],
            preprocessing=json.loads(row[1]),
            segmentation=json.loads(row[2]),
            separation=json.loads(row[3]),
        )
