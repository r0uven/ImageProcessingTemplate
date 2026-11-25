import type { StorageInfo } from "@/entities/settings";

import { displayName, formatBytes, formatDate } from "../lib/format";
import * as F from "./StorageForms.styles";
import * as S from "./StorageManager.styles";

type StorageCardProps = {
  info: StorageInfo;
  editing: boolean;
  busy: string | null;
  editLabel: string;
  editPath: string;
  onEditLabelChange: (value: string) => void;
  onEditPathChange: (value: string) => void;
  onPickFolder: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onActivate: () => void;
  onDelete: () => void;
};

export function StorageCard({
  info,
  editing,
  busy,
  editLabel,
  editPath,
  onEditLabelChange,
  onEditPathChange,
  onPickFolder,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onActivate,
  onDelete,
}: StorageCardProps) {
  const isBusy = busy?.endsWith(info.id) ?? false;

  return (
    <S.StorageCard $active={info.is_active}>
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

      {editing ? (
        <F.StorageInlineForm>
          <F.FormRow>
            <F.FormInput
              value={editLabel}
              placeholder="Название хранилища"
              onChange={(event) => onEditLabelChange(event.target.value)}
            />
          </F.FormRow>

          <F.FormRow>
            <F.FormInput
              value={editPath}
              placeholder="Путь к папке"
              onChange={(event) => onEditPathChange(event.target.value)}
            />

            <F.SmallButton
              type="button"
              disabled={busy !== null}
              onClick={onPickFolder}
            >
              Выбрать папку…
            </F.SmallButton>
          </F.FormRow>

          <F.FormHint>
            Указывайте новый путь только после переноса всей папки: записи
            истории будут перенаправлены на новые файлы. Если файлы не найдены,
            изменение отменится.
          </F.FormHint>

          <F.FormActions>
            <F.SmallButton
              $primary
              type="button"
              disabled={busy !== null}
              onClick={onSaveEdit}
            >
              {isBusy ? "Сохранение..." : "Сохранить"}
            </F.SmallButton>

            <F.SmallButton
              type="button"
              disabled={busy !== null}
              onClick={onCancelEdit}
            >
              Отмена
            </F.SmallButton>
          </F.FormActions>
        </F.StorageInlineForm>
      ) : (
        <S.StorageActions>
          {!info.is_active && (
            <F.SmallButton
              $primary
              type="button"
              disabled={busy !== null}
              onClick={onActivate}
            >
              {isBusy ? "Переключение..." : "Сделать активным"}
            </F.SmallButton>
          )}

          <F.SmallButton
            type="button"
            disabled={busy !== null}
            onClick={onStartEdit}
          >
            Изменить
          </F.SmallButton>

          {!info.is_active && (
            <F.SmallButton
              $danger
              type="button"
              disabled={busy !== null}
              onClick={onDelete}
            >
              Удалить
            </F.SmallButton>
          )}
        </S.StorageActions>
      )}
    </S.StorageCard>
  );
}
