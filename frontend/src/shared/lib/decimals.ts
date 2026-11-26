export const DECIMALS_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;

export const DEFAULT_DECIMALS = 2;

const MAX_DECIMALS = DECIMALS_OPTIONS[DECIMALS_OPTIONS.length - 1];

/**
 * Читает сохранённое количество знаков после запятой.
 *
 * Если в localStorage лежит некорректное значение, возвращает fallback.
 */
export function readStoredDecimals(
  storageKey: string,
  fallback = DEFAULT_DECIMALS,
): number {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return fallback;

    const value = Number(raw);
    if (Number.isInteger(value) && value >= 0 && value <= MAX_DECIMALS) {
      return value;
    }
  } catch {
    // localStorage может быть недоступен — используем значение по умолчанию.
  }

  return fallback;
}

/** Сохраняет выбранное количество знаков после запятой. */
export function storeDecimals(storageKey: string, value: number): void {
  try {
    window.localStorage.setItem(storageKey, String(value));
  } catch {
    // Настройка просто не сохранится между сессиями.
  }
}
