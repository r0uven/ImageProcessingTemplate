"""Подключение к SQLite и пути к файлу базы данных."""

import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BASE_DIR / "data"

DB_PATH = DATA_DIR / "database.db"


def get_connection() -> sqlite3.Connection:
    """Открывает новое соединение с БД, создавая папку ``data`` при необходимости."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH, check_same_thread=False)

    # SQLite по умолчанию не проверяет внешние ключи — включаем явно.
    connection.execute("PRAGMA foreign_keys = ON")

    return connection
