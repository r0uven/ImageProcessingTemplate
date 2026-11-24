import axios from "axios";
import { useMemo, useState } from "react";

import type { AppSettings } from "@/api/settings/settings.api";
import { useAppSettings } from "@/settings/SettingsContext";
import * as S from "./SettingsPage.styles";
import {
  NULLABLE_NUMBERS,
  NULLABLE_STRINGS,
  SECTION_LABELS,
  SELECT_OPTIONS,
  labelFor,
} from "./SettingsPage.labels";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)
      ?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const entry = item as { loc?: unknown[]; msg?: string };
          const location = Array.isArray(entry.loc)
            ? entry.loc.filter((part) => part !== "body").join(".")
            : "";
          return location ? `${location}: ${entry.msg ?? ""}` : String(entry.msg);
        })
        .join("\n");
    }

    if (typeof detail === "string") return detail;

    return error.message;
  }

  return error instanceof Error ? error.message : String(error);
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

export const SettingsPage = () => {
  const { settings, meta, save } = useAppSettings();

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
      const response = await save(draft as unknown as AppSettings);
      setDraft(clone(response.settings) as unknown as Json);
      setMessage("Настройки сохранены в settings.json и применены.");
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setSaving(false);
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

          <S.HeaderActions>
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
          </S.HeaderActions>
        </S.Header>

        <S.Toolbar>
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
                  <ObjectFields
                    value={value}
                    path={section}
                    scope={scope}
                    tokens={filterTokens}
                    onChange={(next) => updateSection(section, next)}
                  />
                </S.SectionBody>
              )}
            </S.SectionCard>
          );
        })}
      </S.Content>
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
