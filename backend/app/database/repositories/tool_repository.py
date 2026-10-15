import sqlite3

from app.database.models import SegmentationModel


class ToolRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create(self, model: SegmentationModel) -> None:
        self.connection.execute(
            """
            INSERT INTO segmentation_models (
                model_id,
                model_name,
                model_type,
                model_path,
                material,
                image,
                removable,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                model.model_id,
                model.model_name,
                model.model_type,
                model.model_path,
                model.material,
                model.image,
                int(model.removable),
                model.created_at,
            ),
        )
        self.connection.commit()

    def get_all(self) -> list[SegmentationModel]:
        cursor = self.connection.execute(
            """
            SELECT
                model_id,
                model_name,
                model_type,
                model_path,
                material,
                image,
                removable,
                created_at
            FROM segmentation_models
            ORDER BY created_at DESC
            """
        )

        return [
            SegmentationModel(
                model_id=row[0],
                model_name=row[1],
                model_type=row[2],
                model_path=row[3],
                material=row[4],
                image=row[5],
                removable=bool(row[6]),
                created_at=row[7],
            )
            for row in cursor.fetchall()
        ]

    def get_by_id(self, model_id: str) -> SegmentationModel | None:
        cursor = self.connection.execute(
            """
            SELECT
                model_id,
                model_name,
                model_type,
                model_path,
                material,
                image,
                removable,
                created_at
            FROM segmentation_models
            WHERE model_id = ?
            """,
            (model_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

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
