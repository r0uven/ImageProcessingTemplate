import axios from "axios";

/**
 * Приводит ошибку к понятному тексту. Для ошибок FastAPI разбирает `detail`:
 * строку или список ошибок валидации с путями к полям.
 */
export function formatError(error: unknown): string {
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
