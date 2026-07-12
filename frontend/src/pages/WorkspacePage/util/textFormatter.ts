export function formatToAccept(formats: string[]) {
  return formats.map((f) => `.${f}`).join(",");
}
