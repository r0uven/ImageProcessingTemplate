import type { StorageInfo } from "@/entities/settings";

export function displayName(info: StorageInfo): string {
  if (info.label.trim()) return info.label.trim();

  const path = info.resolved_path || info.path;
  const normalized = path.replace(/[\\/]+$/, "");
  const name = normalized.split(/[\\/]/).pop();

  return name || info.id;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 Б";

  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
