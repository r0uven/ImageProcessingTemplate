import { useEffect, useMemo, useRef, useState } from "react";

import type { AppSettings, SettingsEnvelope } from "@/api/settings/settings.api";
import { useAppSettings } from "@/settings/SettingsContext";
import {
  NULLABLE_NUMBERS,
  NULLABLE_STRINGS,
  SECTION_LABELS,
  SELECT_OPTIONS,
  labelFor,
} from "@/settings/labels";
import { StorageManager } from "./StorageManager";
import { formatError } from "./formatError";
import * as S from "./SettingsPage.styles";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function searchableValue(value: Json): string {
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

function matchesSearch(
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

function objectHasSearchMatch(
  value: { [key: string]: Json },
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

function sectionScope(section: string): string {
  return `${SECTION_LABELS[section] ?? ""} ${section}`.toLowerCase();
}

const SECTION_ORDER = [
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

function withoutStorageRegistry(value: { [key: string]: Json }) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !STORAGE_REGISTRY_FIELDS.has(key)),
  );
}

function withLatestStorageRegistry(
  draft: Json,
  envelope: SettingsEnvelope,
): Json {
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

export const SettingsPage = () => {
  const { settings, meta, save, reload } = useAppSettings();

  const [draft, setDraft] = useState<Json>(
    () => clone(settings) as unknown as Json,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["storage"]),
  );
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      // Панель прилипла, когда её верхняя граница дошла до top: 24px.
      // В этот момент сдвигаем её вправо от кнопки «Назад».
      const stuck = toolbar.getBoundingClientRect().top <= 25;
      toolbar.dataset.stuck = String(stuck);
    };

    // Первый кадр нужен для восстановленной прокрутки и возврата на страницу.
    const frame = requestAnimationFrame(update);

    // capture ловит прокрутку любого контейнера, а не только window.
    document.addEventListener("scroll", update, true);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pageshow", update);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  );

  const updateSection = (section: string, next: Json) => {
    setDraft((previous) =>
      isObject(previous) ? { ...previous, [section]: next } : previous,
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = withLatestStorageRegistry(draft, meta);
      const response = await save(payload as unknown as AppSettings);
      setDraft(clone(response.settings) as unknown as Json);
      setMessage("Настройки сохранены в settings.json и применены.");
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setSaving(false);
    }
  };

  const handleStorageChanged = async () => {
    // Реестр хранилищ сохраняется сразу через /settings/storages.
    // Подтягиваем актуальные настройки, чтобы черновик не перезаписал
    // реестр устаревшими значениями при следующем «Сохранить».
    const envelope = await reload();

    if (envelope) {
      setDraft((previous) => withLatestStorageRegistry(previous, envelope));
    }
  };

  const sections = useMemo(() => {
    if (!isObject(draft)) return [];

    const keys = Object.keys(draft);
    const ordered = SECTION_ORDER.filter((key) => keys.includes(key));
    const rest = keys.filter((key) => !SECTION_ORDER.includes(key));

    return [...ordered, ...rest];
  }, [draft]);

  const searchTokens = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [query],
  );
  const searching = searchTokens.length > 0;

  const visibleSections = useMemo(() => {
    if (!isObject(draft) || !searchTokens.length) return sections;

    return sections.filter((section) => {
      const value = draft[section];

      if (!isObject(value)) return false;

      const scope = sectionScope(section);

      // Запрос совпал с названием группы — показываем её целиком.
      if (searchTokens.every((token) => scope.includes(token))) return true;

      return objectHasSearchMatch(value, section, scope, searchTokens);
    });
  }, [draft, searchTokens, sections]);

  return (
    <S.Page>
      <S.Content>
        <S.Header>
          <S.TitleBlock>
            <S.Title>Глобальные настройки</S.Title>

            <S.Subtitle>
              Все параметры обработки, хранения и обучения берутся из
              settings.json. Изменения сохраняются в файл и применяются без
              перезапуска backend.
            </S.Subtitle>
          </S.TitleBlock>
        </S.Header>

        <S.Toolbar ref={toolbarRef}>
          <S.SearchBox>
            <S.SearchInput
              type="search"
              value={query}
              placeholder="Поиск по разделам, названиям, путям и значениям"
              aria-label="Поиск по настройкам"
              onChange={(event) => setQuery(event.target.value)}
            />

            {query && (
              <S.ClearSearch
                type="button"
                aria-label="Очистить поиск"
                onClick={() => setQuery("")}
              >
                ×
              </S.ClearSearch>
            )}
          </S.SearchBox>

          <S.ToolbarActions>
            <S.ToolbarButton
              type="button"
              onClick={() => setExpandedSections(new Set(sections))}
            >
              Развернуть всё
            </S.ToolbarButton>

            <S.ToolbarButton
              type="button"
              onClick={() => setExpandedSections(new Set())}
            >
              Свернуть всё
            </S.ToolbarButton>
          </S.ToolbarActions>
        </S.Toolbar>

        <S.MetaCard>
          <S.MetaRow>
            <span>Файл настроек:</span>
            <code>{meta.config_path}</code>
          </S.MetaRow>

          <S.MetaRow>
            <span>Папка изображений:</span>
            <code>{meta.resolved_images_directory}</code>
          </S.MetaRow>

          <S.MetaRow>
            <span>Хранилищ в реестре:</span>
            <code>
              {meta.storages.length}
              {meta.storages.find((entry) => entry.is_active)?.label
                ? ` · активно: ${
                    meta.storages.find((entry) => entry.is_active)?.label
                  }`
                : ""}
            </code>
          </S.MetaRow>

          <S.MetaRow>
            <span>Путь в settings.json:</span>
            <code>{meta.images_directory}</code>
          </S.MetaRow>
        </S.MetaCard>

        {message && <S.Message>{message}</S.Message>}
        {error && <S.Message $error>{error}</S.Message>}

        {searching && (
          <S.SearchHint>
            Найдено разделов: {visibleSections.length}
            {visibleSections.length > 0
              ? ". Подходящие разделы раскрыты автоматически."
              : ". Попробуйте изменить запрос."}
          </S.SearchHint>
        )}

        {searching && visibleSections.length === 0 && (
          <S.EmptyState>По запросу «{query}» ничего не найдено.</S.EmptyState>
        )}

        {visibleSections.map((section) => {
          const value = isObject(draft) ? draft[section] : null;

          if (!isObject(value)) return null;

          const scope = sectionScope(section);
          const sectionMatchesQuery =
            searching && searchTokens.every((token) => scope.includes(token));
          const filterTokens =
            searching && !sectionMatchesQuery ? searchTokens : [];
          const isOpen = searching || expandedSections.has(section);
          const fieldCount = Object.keys(value).length;

          return (
            <S.SectionCard key={section} $open={isOpen}>
              <S.SectionHeaderButton
                type="button"
                aria-expanded={isOpen}
                onClick={() => {
                  if (searching) return;

                  setExpandedSections((previous) => {
                    const next = new Set(previous);

                    if (next.has(section)) {
                      next.delete(section);
                    } else {
                      next.add(section);
                    }

                    return next;
                  });
                }}
              >
                <S.SectionHeading>
                  <S.SectionChevron $open={isOpen}>▸</S.SectionChevron>
                  <S.SectionTitle>
                    {SECTION_LABELS[section] ?? section}
                  </S.SectionTitle>
                </S.SectionHeading>

                <S.SectionMeta>
                  <S.SectionCount>{fieldCount} парам.</S.SectionCount>
                  <S.SectionKey>{section}</S.SectionKey>
                </S.SectionMeta>
              </S.SectionHeaderButton>

              {isOpen && (
                <S.SectionBody>
                  {section === "storage" ? (
                    <S.StorageSection>
                      <StorageManager onChanged={handleStorageChanged} />

                      <ObjectFields
                        value={withoutStorageRegistry(value)}
                        path={section}
                        scope={scope}
                        tokens={filterTokens}
                        onChange={(next) =>
                          updateSection(section, {
                            ...value,
                            ...next,
                            storages: value.storages,
                            active_storage_id: value.active_storage_id,
                          })
                        }
                      />
                    </S.StorageSection>
                  ) : (
                    <ObjectFields
                      value={value}
                      path={section}
                      scope={scope}
                      tokens={filterTokens}
                      onChange={(next) => updateSection(section, next)}
                    />
                  )}
                </S.SectionBody>
              )}
            </S.SectionCard>
          );
        })}
      </S.Content>

      <S.ActionBar>
        <S.ActionBarStatus $dirty={dirty} $error={Boolean(error)}>
          {saving
            ? "Сохранение..."
            : error
              ? "Не удалось сохранить настройки"
              : dirty
                ? "Есть несохранённые изменения"
                : "Все изменения сохранены"}
        </S.ActionBarStatus>

        <S.Button
          type="button"
          onClick={() => {
            setDraft(clone(settings) as unknown as Json);
            setMessage(null);
            setError(null);
          }}
          disabled={!dirty || saving}
        >
          Сбросить изменения
        </S.Button>

        <S.Button
          $primary
          type="button"
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </S.Button>
      </S.ActionBar>
    </S.Page>
  );
};

type ObjectFieldsProps = {
  value: { [key: string]: Json };
  onChange: (next: { [key: string]: Json }) => void;
  path: string;
  scope: string;
  tokens: string[];
};

function ObjectFields({
  value,
  onChange,
  path,
  scope,
  tokens,
}: ObjectFieldsProps) {
  return (
    <S.FieldsGrid>
      {Object.entries(value).map(([key, child]) => (
        <FieldEditor
          key={key}
          fieldKey={key}
          value={child}
          path={`${path}.${key}`}
          scope={scope}
          tokens={tokens}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </S.FieldsGrid>
  );
}

type FieldEditorProps = {
  fieldKey: string;
  value: Json;
  onChange: (next: Json) => void;
  path: string;
  scope: string;
  tokens: string[];
};

function FieldEditor({
  fieldKey,
  value,
  onChange,
  path,
  scope,
  tokens,
}: FieldEditorProps) {
  const label = labelFor(fieldKey);
  const isRawJson =
    isObject(value) &&
    (fieldKey === "entities" || fieldKey === "algorithm_params");
  const valueText = isRawJson
    ? JSON.stringify(value)
    : searchableValue(value);
  const selfMatches = matchesSearch(
    fieldKey,
    path,
    valueText,
    scope,
    tokens,
  );
  const hasNestedMatches =
    isObject(value) &&
    !isRawJson &&
    objectHasSearchMatch(value, path, scope, tokens);

  if (tokens.length && !selfMatches && !hasNestedMatches) {
    return null;
  }

  const childTokens = selfMatches ? [] : tokens;

  const nullableKind = NULLABLE_NUMBERS.has(fieldKey)
    ? "number"
    : NULLABLE_STRINGS.has(fieldKey)
      ? "string"
      : null;

  if (nullableKind) {
    return (
      <S.FieldRow>
        <S.Label>{label}</S.Label>
        <S.PathHint>{path}</S.PathHint>
        <OptionalField
          key={`${path}:${value === null ? "null" : String(value)}`}
          kind={nullableKind}
          value={value}
          onChange={onChange}
        />
      </S.FieldRow>
    );
  }

  if (value === null) {
    return (
      <S.FieldRow>
        <S.Label>{label}</S.Label>
        <S.PathHint>{path}</S.PathHint>
        <OptionalField
          key={`${path}:null`}
          kind="string"
          value={null}
          onChange={onChange}
        />
      </S.FieldRow>
    );
  }

  if (typeof value === "boolean") {
    return (
      <S.CheckboxRow>
        <S.Checkbox
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {label}
          <S.PathHint> {path}</S.PathHint>
        </span>
      </S.CheckboxRow>
    );
  }

  if (typeof value === "number") {
    return (
      <S.FieldRow>
        <S.Label>{label}</S.Label>
        <S.PathHint>{path}</S.PathHint>
        <S.Input
          type="number"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? 0 : Number(event.target.value),
            )
          }
        />
      </S.FieldRow>
    );
  }

  if (typeof value === "string") {
    const options = SELECT_OPTIONS[fieldKey];

    if (options) {
      return (
        <S.FieldRow>
          <S.Label>{label}</S.Label>
          <S.PathHint>{path}</S.PathHint>
          <S.Select
            value={value}
            onChange={(event) =>
              onChange(
                fieldKey === "connectivity"
                  ? Number(event.target.value)
                  : event.target.value,
              )
            }
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </S.Select>
        </S.FieldRow>
      );
    }

    return (
      <S.FieldRow>
        <S.Label>{label}</S.Label>
        <S.PathHint>{path}</S.PathHint>
        <S.Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </S.FieldRow>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ArrayEditor
        fieldKey={fieldKey}
        value={value}
        path={path}
        onChange={onChange}
      />
    );
  }

  if (isObject(value)) {
    if (fieldKey === "entities" || fieldKey === "algorithm_params") {
      return (
        <S.GroupBox>
          <S.GroupTitle>{label}</S.GroupTitle>
          <S.PathHint>{path}</S.PathHint>
          <JsonObjectField
            key={`${path}:${JSON.stringify(value)}`}
            value={value}
            onChange={onChange}
          />
        </S.GroupBox>
      );
    }

    return (
      <S.GroupBox>
        <S.GroupTitle>{label}</S.GroupTitle>
        <S.PathHint>{path}</S.PathHint>
        <ObjectFields
          value={value}
          path={path}
          scope={scope}
          tokens={childTokens}
          onChange={onChange}
        />
      </S.GroupBox>
    );
  }

  return null;
}

type OptionalFieldProps = {
  kind: "number" | "string";
  value: Json;
  onChange: (next: Json) => void;
};

function OptionalField({ kind, value, onChange }: OptionalFieldProps) {
  const [text, setText] = useState(value === null ? "" : String(value));

  const commit = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      onChange(null);
      return;
    }

    if (kind === "number") {
      const parsed = Number(trimmed);
      onChange(Number.isFinite(parsed) ? parsed : null);
      return;
    }

    onChange(trimmed);
  };

  return (
    <S.Input
      value={text}
      placeholder="не задано"
      inputMode={kind === "number" ? "decimal" : "text"}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

type ArrayEditorProps = {
  fieldKey: string;
  value: Json[];
  onChange: (next: Json[]) => void;
  path: string;
};

function arrayKind(value: Json[], fieldKey: string): "string" | "number" | "nested" {
  if (value.length === 0) {
    if (
      fieldKey === "default_size" ||
      fieldKey === "pixel_value_range" ||
      fieldKey === "allowed_sizes"
    ) {
      return "number";
    }

    return "string";
  }

  if (value.every((item) => typeof item === "string")) return "string";
  if (value.every((item) => typeof item === "number")) return "number";
  if (value.every((item) => Array.isArray(item))) return "nested";

  return "string";
}

function ArrayEditor({ fieldKey, value, onChange, path }: ArrayEditorProps) {
  const label = labelFor(fieldKey);
  const kind = arrayKind(value, fieldKey);

  const addItem = () => {
    onChange([
      ...value,
      kind === "number" ? 0 : kind === "nested" ? [0, 0] : "",
    ]);
  };

  return (
    <S.ArrayField>
      <S.Label>{label}</S.Label>
      <S.PathHint>{path}</S.PathHint>

      {value.length === 0 && <S.EmptyText>Список пуст</S.EmptyText>}

      {value.map((item, index) => (
        <S.ArrayRow key={index}>
          {kind === "nested" && Array.isArray(item) ? (
            <S.ArrayRow style={{ flex: 1 }}>
              {item.map((nestedValue, nestedIndex) => (
                <S.ArrayInput
                  key={nestedIndex}
                  type="number"
                  value={typeof nestedValue === "number" ? nestedValue : 0}
                  onChange={(event) => {
                    const nextItem = item.map((entry, entryIndex) =>
                      entryIndex === nestedIndex
                        ? event.target.value === ""
                          ? 0
                          : Number(event.target.value)
                        : entry,
                    );

                    onChange(
                      value.map((entry, entryIndex) =>
                        entryIndex === index ? nextItem : entry,
                      ),
                    );
                  }}
                />
              ))}
            </S.ArrayRow>
          ) : (
            <S.ArrayInput
              type={kind === "number" ? "number" : "text"}
              value={
                typeof item === "string" || typeof item === "number"
                  ? item
                  : ""
              }
              onChange={(event) => {
                const nextValue =
                  kind === "number"
                    ? event.target.value === ""
                      ? 0
                      : Number(event.target.value)
                    : event.target.value;

                onChange(
                  value.map((entry, entryIndex) =>
                    entryIndex === index ? nextValue : entry,
                  ),
                );
              }}
            />
          )}

          <S.IconButton
            type="button"
            title="Удалить"
            onClick={() =>
              onChange(value.filter((_, entryIndex) => entryIndex !== index))
            }
          >
            ✕
          </S.IconButton>
        </S.ArrayRow>
      ))}

      <S.AddButton type="button" onClick={addItem}>
        + Добавить
      </S.AddButton>
    </S.ArrayField>
  );
}

type JsonObjectFieldProps = {
  value: { [key: string]: Json };
  onChange: (next: Json) => void;
};

function JsonObjectField({ value, onChange }: JsonObjectFieldProps) {
  const serialized = JSON.stringify(value, null, 2);

  const [text, setText] = useState(serialized);
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    try {
      const parsed = JSON.parse(text) as Json;

      if (!isObject(parsed)) {
        setError("Ожидается JSON-объект");
        return;
      }

      setError(null);
      onChange(parsed);
    } catch {
      setError("Некорректный JSON");
    }
  };

  return (
    <>
      <S.TextArea
        value={text}
        spellCheck={false}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
      />
      {error && <S.JsonError>{error}</S.JsonError>}
    </>
  );
}
