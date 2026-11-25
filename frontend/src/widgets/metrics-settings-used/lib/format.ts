import type {
  SettingsSnapshotSection,
  SettingsSnapshotValue,
} from "@/entities/analysis";
import { labelFor } from "@/entities/settings";

import type { CardRow } from "./types";

const OPERATION_LABELS: Record<string, string> = {
  closing: "замыкание",
  opening: "размыкание",
  erosion: "эрозия",
  dilation: "дилатация",
  gradient: "градиент",
  tophat: "tophat",
  blackhat: "blackhat",
};

const METHOD_LABELS: Record<string, string> = {
  threshold: "пороговая",
  neural: "нейросетевая",
};

export function isSection(
  value: SettingsSnapshotValue | undefined,
): value is SettingsSnapshotSection {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getPath(
  root: SettingsSnapshotSection | undefined,
  ...path: string[]
): SettingsSnapshotValue | undefined {
  let current: SettingsSnapshotValue | undefined = root;

  for (const key of path) {
    if (!isSection(current)) return undefined;
    current = current[key];
  }

  return current;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Number.isInteger(value)) return String(value);

  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPrimitive(value: SettingsSnapshotValue): string {
  if (value === null) return "—";
  if (Array.isArray(value)) return value.map(formatPrimitive).join("×");
  if (typeof value === "object") return "—";
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (typeof value === "number") return formatNumber(value);

  return String(value);
}

export function formatValue(value: SettingsSnapshotValue | undefined): string {
  if (value === undefined) return "—";
  if (value === null) return "не задан";
  if (typeof value === "boolean") return value ? "вкл" : "выкл";
  if (typeof value === "number") return formatNumber(value);
  if (Array.isArray(value)) return value.length ? formatPrimitive(value) : "—";
  if (typeof value === "object") return "—";

  return OPERATION_LABELS[value] ?? METHOD_LABELS[value] ?? value;
}

export function rows(
  specs: Array<[string, SettingsSnapshotValue | undefined]>,
): CardRow[] {
  return specs
    .filter(
      (spec): spec is [string, SettingsSnapshotValue] => spec[1] !== undefined,
    )
    .map(([label, value]) => ({
      label: labelFor(label),
      value: formatValue(value),
    }));
}

export function enabledLabels(
  value: SettingsSnapshotValue | undefined,
): string {
  if (!isSection(value)) return "—";

  const enabled = Object.entries(value)
    .filter(([, child]) => child === true)
    .map(([key]) => labelFor(key));

  return enabled.length ? enabled.join(", ") : "нет";
}
