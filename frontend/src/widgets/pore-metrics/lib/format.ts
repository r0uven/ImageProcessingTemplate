/** Форматирует число таблицы пор; null и NaN выводятся прочерком. */
export function formatNumber(
  value: number | null,
  maximumFractionDigits = 3,
  minimumFractionDigits = 0,
): string {
  if (value === null || !Number.isFinite(value)) return "—";

  return value.toLocaleString("ru-RU", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}
