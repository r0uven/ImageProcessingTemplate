import sqlite3

from app.database.models import Tool


class ToolRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create(self, tool: Tool) -> None:
        self.connection.execute(
            """
            INSERT INTO tools (
                id,
                name,
                material,
                architecture,
                image,
                removable,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                tool.id,
                tool.name,
                tool.material,
                tool.architecture,
                tool.image,
                int(tool.removable),
                tool.created_at,
            ),
        )

        self.connection.commit()

    def get_all(self) -> list[Tool]:
        cursor = self.connection.execute(
            """
            SELECT
                id,
                name,
                material,
                architecture,
                image,
                removable,
                created_at
            FROM tools
            ORDER BY created_at DESC
            """
        )

        rows = cursor.fetchall()

        return [
            Tool(
                id=row[0],
                name=row[1],
                material=row[2],
                architecture=row[3],
                image=row[4],
                removable=bool(row[5]),
                created_at=row[6],
            )
            for row in rows
        ]

    def get_by_id(self, tool_id: str) -> Tool | None:

        cursor = self.connection.execute(
            """
            SELECT
                id,
                name,
                material,
                architecture,
                image,
                removable,
                created_at
            FROM tools
            WHERE id = ?
            """,
            (tool_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return Tool(
            id=row[0],
            name=row[1],
            material=row[2],
            architecture=row[3],
            image=row[4],
            removable=bool(row[5]),
            created_at=row[6],
        )

    def delete(self, tool_id: str) -> bool:

        cursor = self.connection.execute(
            """
            DELETE FROM tools
            WHERE id = ?
            """,
            (tool_id,),
        )

        self.connection.commit()

        return cursor.rowcount > 0
