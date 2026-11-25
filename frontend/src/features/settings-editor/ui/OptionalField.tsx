import { useState } from "react";

import type { Json } from "../lib/settingsJson";
import * as S from "./SettingsFields.styles";

type OptionalFieldProps = {
  kind: "number" | "string";
  value: Json;
  onChange: (next: Json) => void;
};

export function OptionalField({ kind, value, onChange }: OptionalFieldProps) {
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
