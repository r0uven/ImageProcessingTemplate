import sqlite3

from app.database.models import ImageModel

_COLUMNS = """
    image_id,
    file_path,
    width,
    height,
    scale_value,
    content_hash,
    original_image_name
"""


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
                content_hash,
                original_image_name
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                image.image_id,
                image.file_path,
                image.width,
                image.height,
                image.scale_value,
                image.content_hash,
                image.original_image_name,
            ),
        )
        self.connection.commit()

    def get_by_id(self, image_id: str) -> ImageModel | None:
        cursor = self.connection.execute(
            f"SELECT {_COLUMNS} FROM images WHERE image_id = ?",
            (image_id,),
        )
        row = cursor.fetchone()
        return None if row is None else self._row_to_model(row)

    def get_by_hash(self, content_hash: str) -> ImageModel | None:
        cursor = self.connection.execute(
            f"SELECT {_COLUMNS} FROM images WHERE content_hash = ?",
            (content_hash,),
        )
        row = cursor.fetchone()
        return None if row is None else self._row_to_model(row)

    def get_all(self) -> list[ImageModel]:
        cursor = self.connection.execute(
            f"SELECT {_COLUMNS} FROM images ORDER BY image_id"
        )
        return [self._row_to_model(row) for row in cursor.fetchall()]

    def update_file_path(self, image_id: str, file_path: str) -> None:
        self.connection.execute(
            "UPDATE images SET file_path = ? WHERE image_id = ?",
            (file_path, image_id),
        )
        self.connection.commit()

    def update_original_image_name(self, image_id: str, name: str) -> None:
        self.connection.execute(
            "UPDATE images SET original_image_name = ? WHERE image_id = ?",
            (name, image_id),
        )
        self.connection.commit()

    @staticmethod
    def _row_to_model(row: tuple) -> ImageModel:
        return ImageModel(
            image_id=row[0],
            file_path=row[1],
            width=row[2],
            height=row[3],
            scale_value=row[4],
            content_hash=row[5],
            original_image_name=row[6],
        )
