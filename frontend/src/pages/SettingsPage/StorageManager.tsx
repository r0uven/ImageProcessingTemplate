import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";

import type { StorageInfo } from "@/api/settings/settings.api";
import {
  activateStorage,
  addStorage,
  deleteStorage,
  getStorages,
  updateStorage,
} from "@/api/settings/storage.api";
import {
  Actions,
  CancelButton,
  ConfirmButton,
  Dialog,
  Message,
  Overlay,
  Title,
} from "@/components/ConfirmDialog/ConfirmDialog.styles";
import { formatError } from "./formatError";
import * as S from "./SettingsPage.styles";

type StorageManagerProps = {
  /** Вызывается после успешного изменения реестра на backend. */
  onChanged: () => Promise<void>;
};

function displayName(info: StorageInfo): string {
  if (info.label.trim()) return info.label.trim();

  const path = info.resolved_path || info.path;
  const normalized = path.replace(/[\\/]+$/, "");
  const name = normalized.split(/[\\/]/).pop();

  return name || info.id;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 Б";

  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StorageManager({ onChanged }: StorageManagerProps) {
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

  const imageCount = deleteTarget?.image_count ?? 0;

  return (
    <S.StorageList>
      {error && <S.StorageMessage $error>{error}</S.StorageMessage>}
      {notice && <S.StorageMessage>{notice}</S.StorageMessage>}

      {loading && <S.FormHint>Загрузка реестра хранилищ...</S.FormHint>}

      {infos?.map((info) => {
        const isBusy = busy?.endsWith(info.id) ?? false;

        return (
          <S.StorageCard key={info.id} $active={info.is_active}>
            <S.StorageHeader>
              <S.StorageTitleBlock>
                <S.StorageNameRow>
                  <S.StorageName>{displayName(info)}</S.StorageName>
                  <S.StorageId>{info.id}</S.StorageId>
                </S.StorageNameRow>

                <S.StoragePath title={info.resolved_path || info.path}>
                  {info.resolved_path || info.path}
                </S.StoragePath>
              </S.StorageTitleBlock>

              <S.StorageBadges>
                {info.is_active && (
                  <S.StorageBadge $tone="active">Активное</S.StorageBadge>
                )}

                <S.StorageBadge $tone={info.exists ? "ok" : "warn"}>
                  {info.exists ? "Папка доступна" : "Папка не найдена"}
                </S.StorageBadge>
              </S.StorageBadges>
            </S.StorageHeader>

            <S.StorageStats>
              <span>Изображений: {info.image_count}</span>
              <span>Файлов: {info.file_count}</span>
              <span>Занято: {formatBytes(info.size_bytes)}</span>
              <span>Создано: {formatDate(info.created_at)}</span>
              <span>Использовалось: {formatDate(info.last_used_at)}</span>
            </S.StorageStats>

            {editingId === info.id ? (
              <S.StorageInlineForm>
                <S.FormRow>
                  <S.FormInput
                    value={editLabel}
                    placeholder="Название хранилища"
                    onChange={(event) => setEditLabel(event.target.value)}
                  />
                </S.FormRow>

                <S.FormRow>
                  <S.FormInput
                    value={editPath}
                    placeholder="Путь к папке"
                    onChange={(event) => setEditPath(event.target.value)}
                  />

                  <S.SmallButton
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void pickFolder("edit")}
                  >
                    Выбрать папку…
                  </S.SmallButton>
                </S.FormRow>

                <S.FormHint>
                  Указывайте новый путь только после переноса всей папки:
                  записи истории будут перенаправлены на новые файлы. Если
                  файлы не найдены, изменение отменится.
                </S.FormHint>

                <S.FormActions>
                  <S.SmallButton
                    $primary
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void handleSaveEdit(info)}
                  >
                    {isBusy ? "Сохранение..." : "Сохранить"}
                  </S.SmallButton>

                  <S.SmallButton
                    type="button"
                    disabled={busy !== null}
                    onClick={() => setEditingId(null)}
                  >
                    Отмена
                  </S.SmallButton>
                </S.FormActions>
              </S.StorageInlineForm>
            ) : (
              <S.StorageActions>
                {!info.is_active && (
                  <S.SmallButton
                    $primary
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void handleActivate(info)}
                  >
                    {isBusy ? "Переключение..." : "Сделать активным"}
                  </S.SmallButton>
                )}

                <S.SmallButton
                  type="button"
                  disabled={busy !== null}
                  onClick={() => startEdit(info)}
                >
                  Изменить
                </S.SmallButton>

                {!info.is_active && (
                  <S.SmallButton
                    $danger
                    type="button"
                    disabled={busy !== null}
                    onClick={() => requestDelete(info)}
                  >
                    Удалить
                  </S.SmallButton>
                )}
              </S.StorageActions>
            )}
          </S.StorageCard>
        );
      })}

      <S.StorageForm>
        <S.FormTitle>Добавить хранилище</S.FormTitle>

        <S.FormRow>
          <S.FormInput
            value={newLabel}
            placeholder="Название (необязательно)"
            onChange={(event) => setNewLabel(event.target.value)}
          />
        </S.FormRow>

        <S.FormRow>
          <S.FormInput
            value={newPath}
            placeholder="Путь к папке, например D:\\images"
            onChange={(event) => setNewPath(event.target.value)}
          />

          <S.SmallButton
            type="button"
            disabled={busy !== null}
            onClick={() => void pickFolder("new")}
          >
            Выбрать папку…
          </S.SmallButton>
        </S.FormRow>

        <S.FormRow>
          <S.CheckboxRow
            style={{
              width: "auto",
              border: "none",
              background: "transparent",
              padding: 0,
            }}
          >
            <S.Checkbox
              type="checkbox"
              checked={activateNew}
              onChange={(event) => setActivateNew(event.target.checked)}
            />
            <span>Сделать активным для новых загрузок</span>
          </S.CheckboxRow>
        </S.FormRow>

        <S.FormHint>
          Новые изображения сохраняются только в активное хранилище.
          Изображения из остальных зарегистрированных хранилищ остаются
          доступными в истории, метриках и превью.
        </S.FormHint>

        <S.FormActions>
          <S.SmallButton
            $primary
            type="button"
            disabled={busy !== null}
            onClick={() => void handleAdd()}
          >
            {busy === "add" ? "Добавление..." : "Добавить"}
          </S.SmallButton>
        </S.FormActions>
      </S.StorageForm>

      {deleteTarget && (
        <Overlay
          onClick={() => {
            if (!busy) setDeleteTarget(null);
          }}
        >
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="storage-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <Title id="storage-delete-title">Удалить хранилище?</Title>

            <Message>
              Хранилище «{displayName(deleteTarget)}» будет удалено из реестра.
              {imageCount > 0
                ? ` В нём ${imageCount} изображений, на которые ссылается история.`
                : " Изображений, привязанных к истории, в нём нет."}
            </Message>

            <S.DialogChecks>
              {imageCount > 0 && (
                <S.CheckboxRow>
                  <S.Checkbox
                    type="checkbox"
                    checked={deleteHistory}
                    onChange={(event) =>
                      setDeleteHistory(event.target.checked)
                    }
                  />
                  <span>
                    Удалить изображения и связанную историю ({imageCount})
                  </span>
                </S.CheckboxRow>
              )}

              <S.CheckboxRow>
                <S.Checkbox
                  type="checkbox"
                  checked={deleteFiles}
                  onChange={(event) => setDeleteFiles(event.target.checked)}
                />
                <span>Удалить папку с диска безвозвратно</span>
              </S.CheckboxRow>
            </S.DialogChecks>

            {imageCount > 0 && !deleteHistory && (
              <S.DialogHint>
                Пока история ссылается на изображения, удалить хранилище
                нельзя. Отметьте первый пункт или сначала очистите историю.
              </S.DialogHint>
            )}

            <Actions>
              <CancelButton
                type="button"
                disabled={Boolean(busy)}
                onClick={() => setDeleteTarget(null)}
              >
                Отмена
              </CancelButton>

              <ConfirmButton
                type="button"
                disabled={
                  Boolean(busy) || (imageCount > 0 && !deleteHistory)
                }
                onClick={() => void handleConfirmDelete()}
              >
                {busy ? "Удаление..." : "Удалить"}
              </ConfirmButton>
            </Actions>
          </Dialog>
        </Overlay>
      )}
    </S.StorageList>
  );
}
