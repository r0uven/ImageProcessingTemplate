import sqlite3

from app.database.models import SegmentationModel

_COLUMNS = """
    model_id,
    model_name,
    model_type,
    model_path,
    material,
    image,
    removable,
    created_at
"""


class ToolRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def get_all(self) -> list[SegmentationModel]:
        cursor = self.connection.execute(
            f"SELECT {_COLUMNS} FROM segmentation_models ORDER BY created_at DESC"
        )
        return [self._row_to_model(row) for row in cursor.fetchall()]

    def get_by_id(self, model_id: str) -> SegmentationModel | None:
        cursor = self.connection.execute(
            f"SELECT {_COLUMNS} FROM segmentation_models WHERE model_id = ?",
            (model_id,),
        )
        row = cursor.fetchone()
        return None if row is None else self._row_to_model(row)

    def delete(self, model_id: str) -> bool:
        cursor = self.connection.execute(
            """
            DELETE FROM segmentation_models
            WHERE model_id = ?
              AND removable = 1
            """,
            (model_id,),
        )
        self.connection.commit()
        return cursor.rowcount > 0

    @staticmethod
    def _row_to_model(row: tuple) -> SegmentationModel:
        return SegmentationModel(
            model_id=row[0],
            model_name=row[1],
            model_type=row[2],
            model_path=row[3],
            material=row[4],
            image=row[5],
            removable=bool(row[6]),
            created_at=row[7],
        )
