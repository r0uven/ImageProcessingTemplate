import type {
  DistributionPoint,
  DistributionType,
  MetricUnits,
} from "@/entities/analysis";

export type Section = "characteristics" | "overview";

export type DistributionMeta = {
  title: string;
  unitKey: keyof MetricUnits | null;
  description: string;
};

export const DISTRIBUTION_ORDER: DistributionType[] = [
  "PORE_SIZE",
  "AREA",
  "PERIMETER",
  "CIRCULARITY",
  "FORM_FACTOR",
];

export const DISTRIBUTION_META: Record<DistributionType, DistributionMeta> = {
  PORE_SIZE: {
    title: "Эквивалентный диаметр",
    unitKey: "length",
    description: "Диаметр круга, площадь которого равна площади поры",
  },
  AREA: {
    title: "Площадь поры",
    unitKey: "area",
    description: "Площадь обнаруженной поры",
  },
  PERIMETER: {
    title: "Периметр поры",
    unitKey: "length",
    description: "Длина границы обнаруженной поры",
  },
  CIRCULARITY: {
    title: "Круглость",
    unitKey: null,
    description: "Безразмерная характеристика формы поры",
  },
  FORM_FACTOR: {
    title: "Фактор формы",
    unitKey: null,
    description: "Безразмерная характеристика формы поры",
  },
};

export const STATISTIC_ROWS = [
  { key: "min", label: "Минимальное значение" },
  { key: "max", label: "Максимальное значение" },
  { key: "mean", label: "Среднее значение" },
  { key: "median", label: "Медиана" },
  { key: "standardDeviation", label: "Стандартное отклонение" },
] as const;

export const CHART_DECIMALS_STORAGE_KEY = "distribution-chart-decimals";

/**
 * Округляет значения по оси X и объединяет одинаковые значения в один
 * столбец, чтобы на графике была видна частота, а не по одной поре на бар.
 */
export function groupDistribution(
  points: DistributionPoint[],
  decimals: number,
): DistributionPoint[] {
  const counts = new Map<number, number>();

  for (const point of points) {
    const x = Number(point.x.toFixed(decimals));
    counts.set(x, (counts.get(x) ?? 0) + point.y);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left - right)
    .map(([x, y]) => ({ x, y }));
}

/** Форматирует число для отображения; нечисловые значения — прочерк. */
export function formatNumber(
  value: number,
  maximumFractionDigits = 3,
): string {
  if (!Number.isFinite(value)) return "—";

  return value.toLocaleString("ru-RU", {
    maximumFractionDigits,
  });
}

/** Подпись точности округления для пояснения к графику. */
export function getRoundingLabel(decimals: number): string {
  return decimals === 0
    ? "до целых"
    : `до ${decimals} знаков после запятой`;
}
