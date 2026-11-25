import { client } from "@/shared/api/client";

import type { AppSettings, SettingsEnvelope } from "../model/types";

export async function getSettings(): Promise<SettingsEnvelope> {
  const { data } = await client.get<SettingsEnvelope>("/settings");
  return data;
}

export async function saveSettings(
  settings: AppSettings,
): Promise<SettingsEnvelope> {
  const { data } = await client.put<SettingsEnvelope>("/settings", settings);
  return data;
}
