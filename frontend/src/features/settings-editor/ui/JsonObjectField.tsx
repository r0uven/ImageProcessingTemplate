import { useState } from "react";

import { isObject, type Json, type JsonObject } from "../lib/settingsJson";
import * as S from "./SettingsFields.styles";

type JsonObjectFieldProps = {
  value: JsonObject;
  onChange: (next: Json) => void;
};

/** Редактор сложных объектов в виде текста JSON с валидацией. */
export function JsonObjectField({ value, onChange }: JsonObjectFieldProps) {
  const serialized = JSON.stringify(value, null, 2);

  const [text, setText] = useState(serialized);
  const [error, setError] = useState<string | null>(null);

  /** Разбирает введённый JSON; при ошибке показывает сообщение. */
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
