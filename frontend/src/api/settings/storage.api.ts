import { client } from "../client";
import type { StorageInfo } from "../settings/settings.api";

export type StorageCreatePayload = {
  path: string;
  label?: string;
  activate?: boolean;
};

export type StorageUpdatePayload = {
  path?: string;
  label?: string;
};

export async function getStorages(): Promise<StorageInfo[]> {
  const { data } = await client.get<StorageInfo[]>("/settings/storages");
  return data;
}

export async function addStorage(
  payload: StorageCreatePayload,
): Promise<StorageInfo[]> {
  const { data } = await client.post<StorageInfo[]>(
    "/settings/storages",
    payload,
  );
  return data;
}

export async function updateStorage(
  storageId: string,
  payload: StorageUpdatePayload,
): Promise<StorageInfo[]> {
  const { data } = await client.patch<StorageInfo[]>(
    `/settings/storages/${encodeURIComponent(storageId)}`,
    payload,
  );
  return data;
}

export async function activateStorage(
  storageId: string,
): Promise<StorageInfo[]> {
  const { data } = await client.post<StorageInfo[]>(
    `/settings/storages/${encodeURIComponent(storageId)}/activate`,
  );
  return data;
}

export async function deleteStorage(
  storageId: string,
  options: { deleteFiles?: boolean; deleteHistory?: boolean } = {},
): Promise<StorageInfo[]> {
  const { data } = await client.delete<StorageInfo[]>(
    `/settings/storages/${encodeURIComponent(storageId)}`,
    {
      params: {
        delete_files: options.deleteFiles ?? false,
        delete_history: options.deleteHistory ?? false,
      },
    },
  );
  return data;
}
