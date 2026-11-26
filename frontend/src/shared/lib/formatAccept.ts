/** Превращает список расширений в значение атрибута `accept` для input. */
export function formatToAccept(formats: string[]) {
  return formats.map((f) => `.${f.replace(/^\./, "")}`).join(",");
}
