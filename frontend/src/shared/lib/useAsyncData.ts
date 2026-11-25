import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type UseAsyncDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: Dispatch<SetStateAction<T | null>>;
};

/**
 * Загружает данные при монтировании (и при изменении `deps`).
 * Результат, пришедший после размонтирования компонента, не применяется.
 * Ошибка загрузки логируется в консоль и доступна как `error`.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await loader();

        if (!cancelled) {
          setData(result);
        }
      } catch (cause) {
        console.error(cause);

        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить данные",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
    // Хук принимает список зависимостей извне, поэтому react-hooks/exhaustive-deps
    // не может проверить его статически (рекомендация из документации React).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
