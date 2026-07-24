import sqlite3
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def run_migrations(connection: sqlite3.Connection):

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS migrations (
            version INTEGER PRIMARY KEY
        )
        """
    )

    applied = {row[0] for row in connection.execute("SELECT version FROM migrations")}

    files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    for file in files:
        version = int(file.stem.split("_")[0])

        if version in applied:
            continue

        sql = file.read_text(encoding="utf-8")

        connection.executescript(sql)

        connection.execute(
            """
            INSERT INTO migrations(version)
            VALUES(?)
            """,
            (version,),
        )

        connection.commit()

        print(f"Applied migration {file.name}")
