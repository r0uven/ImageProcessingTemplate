import {
  labelFor,
  NULLABLE_NUMBERS,
  NULLABLE_STRINGS,
  SELECT_OPTIONS,
} from "@/entities/settings";

import {
  isObject,
  matchesSearch,
  objectHasSearchMatch,
  searchableValue,
  type Json,
  type JsonObject,
} from "../lib/settingsJson";
import { ArrayEditor } from "./ArrayEditor";
import { JsonObjectField } from "./JsonObjectField";
import { OptionalField } from "./OptionalField";
import * as S from "./SettingsFields.styles";

type ObjectFieldsProps = {
  value: JsonObject;
  onChange: (next: JsonObject) => void;
  path: string;
  scope: string;
  tokens: string[];
};

/** Рекурсивно рисует поля JSON-объекта настроек. */
export function ObjectFields({
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
  // Сложные структуры редактируются как сырой JSON, а не набором полей.
  const isRawJson =
    isObject(value) &&
    (fieldKey === "entities" || fieldKey === "algorithm_params");
  const valueText = isRawJson ? JSON.stringify(value) : searchableValue(value);
  // Совпадение самого поля с поиском или совпадение во вложенных полях.
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
