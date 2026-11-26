import { client } from "@/shared/api/client";

import type { AppSettings, SettingsEnvelope } from "../model/types";

/** Загружает текущие настройки и метаданные их файла. */
export async function getSettings(): Promise<SettingsEnvelope> {
  const { data } = await client.get<SettingsEnvelope>("/settings");
  return data;
}

/** Сохраняет настройки и возвращает обновлённый envelope. */
export async function saveSettings(
  settings: AppSettings,
): Promise<SettingsEnvelope> {
  const { data } = await client.put<SettingsEnvelope>("/settings", settings);
  return data;
}
