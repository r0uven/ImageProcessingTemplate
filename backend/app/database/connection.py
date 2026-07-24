import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BASE_DIR / "data"

DB_PATH = DATA_DIR / "database.db"


def get_connection():
    DATA_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DB_PATH, check_same_thread=False)

    connection.execute("PRAGMA foreign_keys = ON")

    return connection
