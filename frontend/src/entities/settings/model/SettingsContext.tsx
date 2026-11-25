import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  colors,
  spacing,
  typography,
} from "@/shared/styles/tokens";
import { Button } from "@/shared/ui/button";
import { getSettings, saveSettings } from "../api/settings.api";
import type { AppSettings, SettingsEnvelope } from "./types";

type SettingsContextValue = {
  settings: AppSettings;
  meta: SettingsEnvelope;
  save: (next: AppSettings) => Promise<SettingsEnvelope>;
  reload: () => Promise<SettingsEnvelope | null>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<SettingsEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (): Promise<SettingsEnvelope | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSettings();
      setMeta(response);
      return response;
    } catch (cause) {
      console.error(cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Не удалось загрузить глобальные настройки",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    void load();
  }, [load]);

  const save = useCallback(async (next: AppSettings) => {
    const response = await saveSettings(next);
    setMeta(response);
    return response;
  }, []);

  const value = useMemo<SettingsContextValue | null>(() => {
    if (!meta) return null;

    return {
      settings: meta.settings,
      meta,
      save,
      reload: load,
    };
  }, [load, meta, save]);

  if (!value) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.lg,
          background: colors.background,
          color: colors.text,
          fontFamily: typography.fontFamily,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {loading ? "Загрузка настроек..." : "Не удалось загрузить настройки"}
        </h2>

        {error && (
          <div style={{ color: colors.textMuted, maxWidth: 620 }}>
            {error}
          </div>
        )}

        {!loading && (
          <Button
            type="button"
            $variant="primary"
            onClick={() => void load()}
          >
            Повторить
          </Button>
        )}
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider
export function useAppSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);

  if (!value) {
    throw new Error("useAppSettings must be used inside SettingsProvider");
  }

  return value;
}
