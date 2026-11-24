import copy
import json
import logging
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

from app.config.default_settings import default_settings

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).with_name("settings.json")

# Секции settings.json, которые влияют на результат анализа, но не приходят
# в AnalyzeRequest. Используются и в хеше запуска, и в снимке параметров,
# чтобы оба места всегда учитывали одинаковый набор настроек.
RESULT_SETTINGS_SECTIONS = (
    "image",
    "postprocessing",
    "object_detection",
    "feature_extraction",
)

# Корень backend-приложения. Относительные пути из settings.json
# (например, storage.images_directory) считаются от него.
BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_IMAGES_DIRECTORY = "data/images"


def resolve_backend_path(value: str | Path) -> Path:
    """Преобразует путь из настроек в абсолютный путь внутри backend."""
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


def resolve_images_directory(value: str | Path | None = None) -> Path:
    """Возвращает абсолютную директорию для всех изображений приложения."""
    if value is None:
        value = APP_SETTINGS.get("storage", {}).get(
            "images_directory", DEFAULT_IMAGES_DIRECTORY
        )
    return resolve_backend_path(value)


def _merge_settings(
    defaults: dict[str, Any],
    loaded: dict[str, Any],
) -> dict[str, Any]:
    """Добирает отсутствующие поля из дефолтов, сохраняя значения файла."""
    merged = copy.deepcopy(defaults)
    for key, value in loaded.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _merge_settings(merged[key], value)
        else:
            merged[key] = copy.deepcopy(value)
    return merged


def write_settings_file(
    settings: dict[str, Any],
    path: str | Path = CONFIG_PATH,
) -> None:
    """Атомарно записывает настройки в JSON-файл."""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)

    fd, tmp_name = tempfile.mkstemp(
        prefix=f"{target.name}.",
        suffix=".tmp",
        dir=target.parent,
        text=True,
    )
    tmp_path = Path(tmp_name)

    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as file:
            json.dump(settings, file, ensure_ascii=False, indent=2)
            file.write("\n")
            file.flush()
            os.fsync(file.fileno())
        os.replace(tmp_path, target)
    except BaseException:
        tmp_path.unlink(missing_ok=True)
        raise


def _backup_broken_file(path: Path) -> None:
    """Сохраняет повреждённый файл рядом, чтобы его можно было изучить."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    backup = path.with_name(f"{path.name}.broken-{timestamp}")

    try:
        os.replace(path, backup)
    except OSError:
        logger.exception("Не удалось сохранить копию повреждённого файла %s", path)
        return

    logger.warning("Повреждённый файл настроек сохранён как %s", backup)


def _restore_defaults(path: Path) -> dict[str, Any]:
    """Возвращает дефолты и пытается записать их в файл."""
    settings = default_settings()

    try:
        write_settings_file(settings, path)
    except OSError:
        # Приложение должно запуститься даже при недоступной для записи папке.
        logger.exception(
            "Не удалось создать файл настроек %s; используются значения "
            "по умолчанию только в памяти",
            path,
        )

    return settings


def load_settings(path: str | Path = CONFIG_PATH) -> dict[str, Any]:
    """Читает настройки, создавая файл из дефолтов при его отсутствии."""
    target = Path(path)

    if not target.is_file():
        logger.warning(
            "Файл настроек %s не найден — создаю значения по умолчанию",
            target,
        )
        return _restore_defaults(target)

    try:
        loaded = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        logger.error("Не удалось прочитать настройки из %s: %s", target, exc)
        _backup_broken_file(target)
        return _restore_defaults(target)

    if not isinstance(loaded, dict):
        logger.error("Файл настроек %s должен содержать JSON-объект", target)
        _backup_broken_file(target)
        return _restore_defaults(target)

    return _merge_settings(default_settings(), loaded)


def ensure_settings_file(path: str | Path = CONFIG_PATH) -> dict[str, Any]:
    """Возвращает настройки, гарантируя наличие файла settings.json."""
    return load_settings(path)


APP_SETTINGS = ensure_settings_file()
