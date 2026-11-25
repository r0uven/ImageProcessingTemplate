import { useCallback, useMemo, useState } from "react";

import {
  useAppSettings,
  type AppSettings,
  type SettingsEnvelope,
} from "@/entities/settings";
import {
  clone,
  isObject,
  withLatestStorageRegistry,
  type Json,
} from "@/features/settings-editor";
import { formatError } from "@/shared/lib/formatError";

export function useSettingsDraft() {
  const { settings, meta, save, reload } = useAppSettings();

  const [draft, setDraft] = useState<Json>(
    () => clone(settings) as unknown as Json,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  );

  const updateSection = useCallback((section: string, next: Json) => {
    setDraft((previous) =>
      isObject(previous) ? { ...previous, [section]: next } : previous,
    );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = withLatestStorageRegistry(draft, meta);
      const response = await save(payload as unknown as AppSettings);
      setDraft(clone(response.settings) as unknown as Json);
      setMessage("Настройки сохранены в settings.json и применены.");
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setSaving(false);
    }
  };

  const handleStorageChanged = async () => {
    // Реестр хранилищ сохраняется сразу через /settings/storages.
    // Подтягиваем актуальные настройки, чтобы черновик не перезаписал
    // реестр устаревшими значениями при следующем «Сохранить».
    const envelope: SettingsEnvelope | null = await reload();

    if (envelope) {
      setDraft((previous) => withLatestStorageRegistry(previous, envelope));
    }
  };

  const reset = useCallback(() => {
    setDraft(clone(settings) as unknown as Json);
    setMessage(null);
    setError(null);
  }, [settings]);

  return {
    draft,
    meta,
    saving,
    message,
    error,
    dirty,
    updateSection,
    reset,
    handleSave,
    handleStorageChanged,
  };
}
