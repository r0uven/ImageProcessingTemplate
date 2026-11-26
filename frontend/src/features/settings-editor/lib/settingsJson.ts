import { labelFor, SECTION_LABELS } from "@/entities/settings";
import type { SettingsEnvelope } from "@/entities/settings";

export type Json = null | boolean | number | string | Json[] | JsonObject;

export type JsonObject = { [key: string]: Json };

/** Проверяет, что значение — именно объект (а не массив и не null). */
export function isObject(value: Json): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Глубокая копия JSON-значения через сериализацию. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Строка, по которой значение настройки участвует в поиске. */
export function searchableValue(value: Json): string {
  if (value === null) return "null не задано";

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        Array.isArray(item) ? item.join(" ") : item === null ? "" : String(item),
      )
      .join(" ");
  }

  if (typeof value === "boolean") {
    return value ? "true включено" : "false выключено";
  }

  if (typeof value === "object") return "";

  return String(value);
}

/** Все слова поискового запроса должны встречаться в строке настройки. */
export function matchesSearch(
  fieldKey: string,
  path: string,
  valueText: string,
  scope: string,
  tokens: string[],
): boolean {
  if (!tokens.length) return true;

  const haystack =
    `${scope} ${fieldKey} ${labelFor(fieldKey)} ${path} ${valueText}`.toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

/** Рекурсивно проверяет, есть ли совпадение поиска во вложенных полях объекта. */
export function objectHasSearchMatch(
  value: JsonObject,
  path: string,
  scope: string,
  tokens: string[],
): boolean {
  return Object.entries(value).some(([key, child]) => {
    const childPath = `${path}.${key}`;

    if (matchesSearch(key, childPath, searchableValue(child), scope, tokens)) {
      return true;
    }

    return isObject(child)
      ? objectHasSearchMatch(child, childPath, scope, tokens)
      : false;
  });
}

export function sectionScope(section: string): string {
  return `${SECTION_LABELS[section] ?? ""} ${section}`.toLowerCase();
}

export function getSearchTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export const SECTION_ORDER = [
  "storage",
  "image",
  "preprocessing",
  "segmentation",
  "postprocessing",
  "object_detection",
  "object_classification",
  "pore_separation",
  "pore_merging",
  "feature_extraction",
  "analysis_pipeline",
  "training",
];

/**
 * Поля реестра хранилищ редактируются отдельным компонентом StorageManager,
 * поэтому общий редактор JSON их не показывает и не перезаписывает.
 */
const STORAGE_REGISTRY_FIELDS = new Set(["storages", "active_storage_id"]);

export function withoutStorageRegistry(value: JsonObject): JsonObject {
  // Убираем поля реестра, чтобы общий редактор не затёр их устаревшей копией.
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !STORAGE_REGISTRY_FIELDS.has(key)),
  );
}

export function withLatestStorageRegistry(
  draft: Json,
  envelope: SettingsEnvelope,
): Json {
  // Перед сохранением подставляем самый свежий реестр хранилищ с backend.
  if (!isObject(draft) || !isObject(draft.storage)) return draft;

  return {
    ...draft,
    storage: {
      ...draft.storage,
      active_storage_id: envelope.settings.storage.active_storage_id,
      storages: envelope.settings.storage.storages as unknown as Json,
    },
  };
}
