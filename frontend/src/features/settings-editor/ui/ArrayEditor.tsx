import { labelFor } from "@/entities/settings";
import { IconButton } from "@/shared/ui/button";

import type { Json } from "../lib/settingsJson";
import * as S from "./SettingsFields.styles";

type ArrayEditorProps = {
  fieldKey: string;
  value: Json[];
  onChange: (next: Json[]) => void;
  path: string;
};

function arrayKind(
  value: Json[],
  fieldKey: string,
): "string" | "number" | "nested" {
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

export function ArrayEditor({
  fieldKey,
  value,
  onChange,
  path,
}: ArrayEditorProps) {
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
                typeof item === "string" || typeof item === "number" ? item : ""
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

          <IconButton
            type="button"
            $variant="danger"
            $size={34}
            title="Удалить"
            onClick={() =>
              onChange(value.filter((_, entryIndex) => entryIndex !== index))
            }
          >
            ✕
          </IconButton>
        </S.ArrayRow>
      ))}

      <S.AddButton
        type="button"
        $variant="secondary"
        $size="sm"
        onClick={addItem}
      >
        + Добавить
      </S.AddButton>
    </S.ArrayField>
  );
}
