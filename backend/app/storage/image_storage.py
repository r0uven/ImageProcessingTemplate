import hashlib
import logging
import os
import re
import shutil
import threading
import time
import uuid
from collections import OrderedDict
from collections.abc import Callable
from pathlib import Path
from typing import TypeVar

import cv2
import numpy as np
from PIL import Image

from app.config.config_loader import APP_SETTINGS

T = TypeVar("T")

logger = logging.getLogger(__name__)

DEFAULT_CACHE_MAX_AGE_DAYS = 183
DEFAULT_CACHE_MAX_TOTAL_BYTES = 10 * 1024**3
DEFAULT_CLEANUP_INTERVAL_MINUTES = 30
DEFAULT_CLEANUP_MAX_DELETIONS = 25

# Регулярное выражение для проверки безопасных имен файлов/ID (предотвращает path traversal и некорректные символы)
_SAFE_NAME = re.compile(r"^[A-Za-z0-9_-]{1,128}$")
# Множество разрешенных расширений для оригиналов изображений
_ALLOWED_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}


class ImageStorage:
    """
    Файловое хранилище изображений с поддержкой кэширования, атомарной записи
    и потокобезопасности.

    Файлы на диске являются источником правды. Путь к файлу сохраняет и хранит БД:
    методы save_* возвращают объект Path, а get_* принимают этот путь.
    Хранилище намеренно не угадывает пути по одному лишь image_id.

    Оригиналы возвращаются как np.ndarray (в формате BGR, OpenCV).
    Превью и изображения анализа возвращаются как PIL.Image (в формате RGB).
    """

    def __init__(self, base_dir: str | Path = "data/images", cache_size: int = 32):
        """
        Инициализирует хранилище изображений.

        Args:
            base_dir: Корневая директория для хранения всех файлов.
            cache_size: Максимальное количество элементов в каждом из кэшей.
        """
        self.base_dir = Path(base_dir).resolve()
        self.original_dir = self.base_dir / "originals"
        self.preview_dir = self.base_dir / "previews"
        self.analysis_dir = self.base_dir / "analysis"

        # Создаем необходимые директории, если они еще не существуют
        for directory in (self.original_dir, self.preview_dir, self.analysis_dir):
            directory.mkdir(parents=True, exist_ok=True)

        self._cache_size = cache_size
        self._lock = (
            threading.RLock()
        )  # Рекурсивный мьютекс для потокобезопасного доступа к кэшу

        storage_settings = APP_SETTINGS.get("storage", {})
        self.cache_max_age_seconds = (
            int(storage_settings.get("cache_max_age_days", DEFAULT_CACHE_MAX_AGE_DAYS))
            * 24
            * 60
            * 60
        )
        self.cache_max_total_bytes = int(
            storage_settings.get("cache_max_total_bytes", DEFAULT_CACHE_MAX_TOTAL_BYTES)
        )
        self.cleanup_interval_seconds = (
            int(
                storage_settings.get(
                    "cleanup_interval_minutes",
                    DEFAULT_CLEANUP_INTERVAL_MINUTES,
                )
            )
            * 60
        )
        self.cleanup_max_deletions_per_run = int(
            storage_settings.get(
                "cleanup_max_deletions_per_run", DEFAULT_CLEANUP_MAX_DELETIONS
            )
        )

        # LRU-кэши (OrderedDict) для разных типов изображений
        self._original_cache: OrderedDict[Path, np.ndarray] = OrderedDict()
        self._preview_cache: OrderedDict[Path, Image.Image] = OrderedDict()
        self._analysis_cache: OrderedDict[Path, Image.Image] = OrderedDict()

    # ------------------------------------------------------------------
    # Утилиты
    # ------------------------------------------------------------------

    @staticmethod
    def compute_hash(data: bytes) -> str:
        """Вычисляет SHA-256 хэш от переданных байтов."""
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def _check_name(value: str, label: str) -> str:
        """
        Проверяет строку (image_id или run_id) на соответствие безопасным паттернам.
        Вызывает ValueError при обнаружении недопустимых символов.
        """
        if not _SAFE_NAME.match(value):
            raise ValueError(f"Недопустимое значение {label}: {value!r}")
        return value

    @staticmethod
    def _atomic_write(path: Path, writer: Callable[[Path], T]) -> T:
        """
        Выполняет атомарную запись файла.
        Данные сначала записываются во временный файл в той же директории,
        после чего атомарно заменяют целевой файл с помощью os.replace.
        Возвращает результат writer, чтобы можно было получить, например, хэш.
        """
        tmp = path.with_name(f"{path.name}.{uuid.uuid4().hex}.tmp")
        try:
            result = writer(tmp)
            os.replace(tmp, path)
            return result
        except BaseException:
            # В случае ошибки удаляем временный файл, если он успел создаться
            tmp.unlink(missing_ok=True)
            raise

    @staticmethod
    def _normalize_suffix(suffix: str) -> str:
        """Приводит расширение к виду '.png' и проверяет, что оно разрешено."""
        suffix = suffix.lower()
        if not suffix.startswith("."):
            suffix = f".{suffix}"
        if suffix not in _ALLOWED_SUFFIXES:
            raise ValueError(f"Недопустимое расширение: {suffix!r}")
        return suffix

    @staticmethod
    def compute_file_hash(file_path: str | Path) -> str:
        """Считает SHA-256 файла потоково, не загружая его целиком в память."""
        hasher = hashlib.sha256()

        with Path(file_path).open("rb") as file:
            for chunk in iter(lambda: file.read(1024 * 1024), b""):
                hasher.update(chunk)

        return hasher.hexdigest()

    def _ensure_inside_base(self, file_path: str | Path) -> Path:
        """
        Проверяет, что запрашиваемый путь физически находится внутри корневой директории
        хранилища (защита от Path Traversal атак).
        """
        path = Path(file_path).resolve()
        if self.base_dir not in path.parents:
            raise ValueError(f"Путь вне хранилища: {path}")
        return path

    def _load_cached(
        self,
        cache: OrderedDict,
        file_path: str | Path,
        loader: Callable[[Path], T | None],
    ) -> T | None:
        """
        Универсальный метод для загрузки данных с использованием кэша (LRU)
        и потокобезопасности.
        """
        path = self._ensure_inside_base(file_path)

        # Проверяем кэш под блокировкой
        with self._lock:
            if path in cache:
                cache.move_to_end(path)  # Обновляем статус использования (LRU)
                return cache[path]

        # Чтение с диска выполняется БЕЗ блокировки, чтобы не удерживать мьютекс
        # во время тяжелых операций ввода-вывода (I/O).
        value = loader(path)
        if value is None:
            return None

        # Сохраняем результат в кэш под блокировкой
        with self._lock:
            cache[path] = value
            cache.move_to_end(path)
            # Если размер кэша превысил лимит, удаляем самый старый элемент (FIFO/LRU)
            while len(cache) > self._cache_size:
                cache.popitem(last=False)

        return value

    def _invalidate(self, cache: OrderedDict, path: Path) -> None:
        """Удаляет файл из указанного кэша при его изменении или перезаписи."""
        with self._lock:
            cache.pop(path, None)

    # ------------------------------------------------------------------
    # Оригиналы изображений
    # ------------------------------------------------------------------

    def save_original(self, image_id: str, data: bytes, suffix: str) -> Path:
        """
        Сохраняет оригинальное изображение в директорию originals.

        Args:
            image_id: Уникальный идентификатор изображения.
            data: Бинарное содержимое файла.
            suffix: Расширение файла (например, '.jpg' или 'png').

        Returns:
            Path к сохраненному файлу.
        """
        self._check_name(image_id, "image_id")

        suffix = self._normalize_suffix(suffix)

        path = self.original_dir / f"{image_id}{suffix}"
        self._atomic_write(path, lambda tmp: tmp.write_bytes(data))
        self._invalidate(self._original_cache, path)

        return path

    def copy_original(
        self,
        image_id: str,
        source_path: str | Path,
        suffix: str,
    ) -> Path:
        """Копирует файл из файловой системы в ``originals`` без чтения в память."""
        self._check_name(image_id, "image_id")

        source = Path(source_path)
        if not source.is_file():
            raise FileNotFoundError(f"Файл не найден: {source}")

        suffix = self._normalize_suffix(suffix)

        path = self.original_dir / f"{image_id}{suffix}"
        self._atomic_write(path, lambda tmp: shutil.copyfile(source, tmp))
        self._invalidate(self._original_cache, path)

        return path

    @staticmethod
    def _read_original(path: Path) -> np.ndarray | None:
        """Внутренний метод для чтения оригинала с диска через OpenCV."""
        if not path.is_file():
            return None
        try:
            buf = np.fromfile(str(path), dtype=np.uint8)
        except OSError:
            return None

        # cv2.imdecode корректно работает с не-ASCII путями на Windows (в отличие от cv2.imread).
        # IMREAD_UNCHANGED сохраняет исходное количество каналов (включая альфа-канал) и глубину бит.
        return cv2.imdecode(buf, cv2.IMREAD_UNCHANGED)

    def get_original(self, file_path: str | Path) -> np.ndarray | None:
        """
        Возвращает оригинальное изображение в виде numpy.ndarray (BGR).
        Использует кэширование. Возвращает копию массива во избежание мутации кэша.
        """
        image = self._load_cached(self._original_cache, file_path, self._read_original)
        return None if image is None else image.copy()

    # ------------------------------------------------------------------
    # Превью изображений
    # ------------------------------------------------------------------

    def save_preview(self, image_id: str, image: Image.Image) -> Path:
        """
        Сохраняет уменьшенную копию (превью) изображения в формате PNG.
        """
        self._check_name(image_id, "image_id")

        path = self.preview_path(image_id)
        self._atomic_write(path, lambda tmp: image.save(tmp, format="PNG"))
        self._invalidate(self._preview_cache, path)

        return path

    @staticmethod
    def _read_pil(path: Path) -> Image.Image | None:
        """Внутренний метод для чтения изображений через библиотеку Pillow (PIL)."""
        if not path.is_file():
            return None
        try:
            with Image.open(path) as img:
                return img.copy()
        except OSError:
            return None

    def get_preview(self, file_path: str | Path) -> Image.Image | None:
        """
        Возвращает превью изображения в виде PIL.Image (RGB).
        Использует кэширование. Возвращает копию объекта.
        """
        image = self._load_cached(self._preview_cache, file_path, self._read_pil)
        return None if image is None else image.copy()

    # ------------------------------------------------------------------
    # Результаты анализа (привязаны к run_id)
    # ------------------------------------------------------------------

    def save_analysis_image(self, run_id: str, name: str, image: Image.Image) -> Path:
        """
        Сохраняет изображение результатов анализа, сгруппированное по идентификатору запуска (run_id).
        """
        self._check_name(run_id, "run_id")
        self._check_name(name, "name")

        # Создаем поддиректорию для конкретного запуска анализа, если она отсутствует
        run_dir = self.analysis_dir / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        path = self.analysis_image_path(run_id, name)
        self._atomic_write(path, lambda tmp: image.save(tmp, format="PNG"))
        self._invalidate(self._analysis_cache, path)

        return path

    def get_analysis_image(self, file_path: str | Path) -> Image.Image | None:
        """
        Возвращает изображение результата анализа в виде PIL.Image.
        Использует кэширование.
        """
        image = self._load_cached(self._analysis_cache, file_path, self._read_pil)
        return None if image is None else image.copy()

    def preview_path(self, image_id: str) -> Path:
        self._check_name(image_id, "image_id")
        return self.preview_dir / f"{image_id}.png"

    def analysis_image_path(self, run_id: str, name: str) -> Path:
        self._check_name(run_id, "run_id")
        self._check_name(name, "name")
        return self.analysis_dir / run_id / f"{name}.png"

    def delete_analysis_images(self, run_id: str) -> int:
        """Удаляет изображения запуска вместе с его поддиректорией.

        Returns:
            Количество удалённых файлов.
        """
        self._check_name(run_id, "run_id")
        run_dir = self.analysis_dir / run_id

        if not run_dir.is_dir():
            return 0

        removed = 0

        with self._lock:
            for path in run_dir.iterdir():
                if not path.is_file():
                    continue

                self._analysis_cache.pop(path.resolve(), None)

                try:
                    path.unlink()
                except FileNotFoundError:
                    pass
                except OSError:
                    logger.warning("Failed to remove analysis image: %s", path)
                    continue

                removed += 1

        try:
            run_dir.rmdir()
        except OSError:
            logger.warning("Failed to remove analysis run directory: %s", run_dir)

        return removed

    # ------------------------------------------------------------------
    # Очистка кэша (оригиналы и "красивые" превью)
    # ------------------------------------------------------------------

    def _cache_files_oldest_first(self) -> list[tuple[float, Path, int]]:
        """Собирает файлы originals и previews, сортируя их от старых к новым."""
        files: list[tuple[float, Path, int]] = []

        for directory in (self.original_dir, self.preview_dir):
            try:
                entries = directory.iterdir()
            except OSError:
                logger.warning("Failed to read cache directory: %s", directory)
                continue

            for path in entries:
                try:
                    if not path.is_file():
                        continue
                    stat = path.stat()
                except OSError:
                    continue

                files.append((stat.st_mtime, path, stat.st_size))

        files.sort(key=lambda item: item[0])
        return files

    def cleanup_cache(self) -> dict[str, int]:
        """Удаляет устаревшие или лишние файлы кэша по одному, начиная с самых старых.

        Файл удаляется, если он старше ``cache_max_age_days`` или если
        суммарный размер originals + previews превышает ``cache_max_total_bytes``.
        За один проход удаляется не более ``cleanup_max_deletions_per_run`` файлов,
        чтобы очистка шла постепенно.
        """
        deadline = time.time() - self.cache_max_age_seconds
        files = self._cache_files_oldest_first()
        total_bytes = sum(size for _, _, size in files)

        removed_files = 0
        removed_bytes = 0

        for mtime, path, size in files:
            if removed_files >= self.cleanup_max_deletions_per_run:
                break

            is_expired = mtime < deadline
            is_over_limit = total_bytes > self.cache_max_total_bytes

            # Файлы отсортированы по mtime: если самый старый ещё не устарел
            # и лимит не превышен, удалять дальше нечего.
            if not is_expired and not is_over_limit:
                break

            try:
                path.unlink()
            except FileNotFoundError:
                pass
            except OSError:
                logger.warning("Failed to remove cache file: %s", path)
                continue

            with self._lock:
                self._original_cache.pop(path, None)
                self._preview_cache.pop(path, None)

            total_bytes -= size
            removed_bytes += size
            removed_files += 1

        if removed_files:
            logger.info(
                "Cache cleanup removed %s files (%.2f MB), remaining: %.2f MB",
                removed_files,
                removed_bytes / (1024 * 1024),
                total_bytes / (1024 * 1024),
            )

        return {
            "removed_files": removed_files,
            "removed_bytes": removed_bytes,
            "remaining_bytes": total_bytes,
        }
