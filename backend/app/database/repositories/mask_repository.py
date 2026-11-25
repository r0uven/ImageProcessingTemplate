"""Хранение метаданных масок, сохранённых для запуска анализа.

Сами файлы масок лежат в хранилище изображений; таблица ``masks`` хранит
только связь ``run_id`` + ``mask_type`` + ``file_path``.
"""

import sqlite3

from app.database.models import MaskModel


class MaskRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def upsert(self, mask: MaskModel) -> None:
        """Создаёт или обновляет запись маски.

        ``mask_id`` детерминированный (``<run_id>:<mask_type>``), поэтому
        повторное сохранение того же запуска не создаёт дубликаты.
        """
        self.connection.execute(
            """
            INSERT INTO masks (mask_id, run_id, mask_type, file_path)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(mask_id) DO UPDATE SET
                run_id = excluded.run_id,
                mask_type = excluded.mask_type,
                file_path = excluded.file_path
            """,
            (
                mask.mask_id,
                mask.run_id,
                mask.mask_type,
                mask.file_path,
            ),
        )
        self.connection.commit()

    def get_by_run(self, run_id: str) -> list[MaskModel]:
        cursor = self.connection.execute(
            """
            SELECT mask_id, run_id, mask_type, file_path
            FROM masks
            WHERE run_id = ?
            ORDER BY mask_type
            """,
            (run_id,),
        )
        return [
            MaskModel(
                mask_id=row[0],
                run_id=row[1],
                mask_type=row[2],
                file_path=row[3],
            )
            for row in cursor.fetchall()
        ]
