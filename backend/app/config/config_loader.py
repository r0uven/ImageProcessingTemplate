import json
from pathlib import Path

CONFIG_PATH = Path(__file__).with_name("settings.json")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    APP_SETTINGS = json.load(f)
