import { useCallback, useEffect, useState } from "react";

import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import type { StorageInfo } from "@/entities/settings";
import { formatError } from "@/shared/lib/formatError";

import {
  activateStorage,
  addStorage,
  deleteStorage,
  getStorages,
  updateStorage,
} from "../api/storage.api";
import { displayName } from "../lib/format";

type UseStorageManagerOptions = {
  /** Вызывается после успешного изменения реестра на backend. */
  onChanged: () => Promise<void>;
};

export function useStorageManager({ onChanged }: UseStorageManagerOptions) {
  const [infos, setInfos] = useState<StorageInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newPath, setNewPath] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [activateNew, setActivateNew] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPath, setEditPath] = useState("");
  const [editLabel, setEditLabel] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<StorageInfo | null>(null);
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [deleteHistory, setDeleteHistory] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getStorages();
      setInfos(data);
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!deleteTarget) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        setDeleteTarget(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, busy]);

  async function run(
    key: string,
    action: () => Promise<StorageInfo[]>,
    successMessage: string,
  ): Promise<boolean> {
    setBusy(key);
    setError(null);
    setNotice(null);

    try {
      const next = await action();
      setInfos(next);
      await onChanged();
      setNotice(successMessage);
      return true;
    } catch (cause) {
      setError(formatError(cause));
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function pickFolder(target: "new" | "edit") {
    if (!isTauri()) {
      setError(
        "Выбор папки доступен в настольном приложении. Введите путь вручную.",
      );
      return;
    }

    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Папка хранилища изображений",
      });

      if (typeof selected !== "string") return;

      if (target === "new") {
        setNewPath(selected);
      } else {
        setEditPath(selected);
      }
    } catch (cause) {
      setError(formatError(cause));
    }
  }

  async function handleAdd() {
    const path = newPath.trim();

    if (!path) {
      setError("Укажите путь к папке хранилища");
      return;
    }

    const ok = await run(
      "add",
      () =>
        addStorage({
          path,
          label: newLabel.trim(),
          activate: activateNew,
        }),
      "Хранилище добавлено в реестр.",
    );

    if (ok) {
      setNewPath("");
      setNewLabel("");
      setActivateNew(false);
    }
  }

  async function handleActivate(info: StorageInfo) {
    await run(
      `activate:${info.id}`,
      () => activateStorage(info.id),
      `Новые изображения будут сохраняться в «${displayName(info)}».`,
    );
  }

  function startEdit(info: StorageInfo) {
    setEditingId(info.id);
    setEditPath(info.path);
    setEditLabel(info.label);
    setError(null);
    setNotice(null);
  }

  async function handleSaveEdit(info: StorageInfo) {
    const path = editPath.trim();

    if (!path) {
      setError("Путь к папке не может быть пустым");
      return;
    }

    const ok = await run(
      `edit:${info.id}`,
      () =>
        updateStorage(info.id, {
          path,
          label: editLabel.trim(),
        }),
      "Хранилище обновлено.",
    );

    if (ok) {
      setEditingId(null);
    }
  }

  function requestDelete(info: StorageInfo) {
    setDeleteTarget(info);
    setDeleteFiles(false);
    setDeleteHistory(false);
    setError(null);
    setNotice(null);
  }

  async function handleConfirmDelete() {
    const target = deleteTarget;
    if (!target) return;

    const ok = await run(
      `delete:${target.id}`,
      () =>
        deleteStorage(target.id, {
          deleteFiles,
          deleteHistory,
        }),
      `Хранилище «${displayName(target)}» удалено из реестра.`,
    );

    if (ok) {
      setDeleteTarget(null);
    }
  }

  return {
    infos,
    loading,
    busy,
    error,
    notice,
    newPath,
    setNewPath,
    newLabel,
    setNewLabel,
    activateNew,
    setActivateNew,
    editingId,
    setEditingId,
    editPath,
    setEditPath,
    editLabel,
    setEditLabel,
    deleteTarget,
    setDeleteTarget,
    deleteFiles,
    setDeleteFiles,
    deleteHistory,
    setDeleteHistory,
    pickFolder,
    handleAdd,
    handleActivate,
    startEdit,
    handleSaveEdit,
    requestDelete,
    handleConfirmDelete,
  };
}
