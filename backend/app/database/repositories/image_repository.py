import sqlite3

from app.database.models import ImageModel


class ImageRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create(self, image: ImageModel) -> None:
        self.connection.execute(
            """
            INSERT INTO images (
                image_id,
                file_path,
                width,
                height,
                scale_value,
                content_hash
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                image.image_id,
                image.file_path,
                image.width,
                image.height,
                image.scale_value,
                image.content_hash,
            ),
        )
        self.connection.commit()

    def get_by_id(self, image_id: str) -> ImageModel | None:
        cursor = self.connection.execute(
            """
            SELECT
                image_id,
                file_path,
                width,
                height,
                scale_value,
                content_hash
            FROM images
            WHERE image_id = ?
            """,
            (image_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return self._row_to_model(row)

    def get_by_hash(self, content_hash: str) -> ImageModel | None:
        cursor = self.connection.execute(
            """
            SELECT
                image_id,
                file_path,
                width,
                height,
                scale_value,
                content_hash
            FROM images
            WHERE content_hash = ?
            """,
            (content_hash,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return self._row_to_model(row)

    def get_all(self) -> list[ImageModel]:
        cursor = self.connection.execute(
            """
            SELECT
                image_id,
                file_path,
                width,
                height,
                scale_value,
                content_hash
            FROM images
            ORDER BY image_id
            """
        )

        return [self._row_to_model(row) for row in cursor.fetchall()]

    def delete(self, image_id: str) -> bool:
        cursor = self.connection.execute(
            """
            DELETE FROM images
            WHERE image_id = ?
            """,
            (image_id,),
        )

        self.connection.commit()
        return cursor.rowcount > 0

    @staticmethod
    def _row_to_model(row: tuple) -> ImageModel:
        return ImageModel(
            image_id=row[0],
            file_path=row[1],
            width=row[2],
            height=row[3],
            scale_value=row[4],
            content_hash=row[5],
        )

    def update_file_path(self, image_id: str, file_path: str) -> None:
        self.connection.execute(
            "UPDATE images SET file_path = ? WHERE image_id = ?",
            (file_path, image_id),
        )
        self.connection.commit()
