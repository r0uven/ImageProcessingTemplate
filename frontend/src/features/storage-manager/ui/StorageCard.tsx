import type { StorageInfo } from "@/entities/settings";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

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

/** Карточка хранилища: статистика, активация, редактирование и удаление. */
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
          {info.is_active && <Badge $variant="primary">Активное</Badge>}

          <Badge $variant={info.exists ? "success" : "warning"}>
            {info.exists ? "Папка доступна" : "Папка не найдена"}
          </Badge>
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

            <Button
              type="button"
              $variant="secondary"
              $size="sm"
              disabled={busy !== null}
              onClick={onPickFolder}
            >
              Выбрать папку…
            </Button>
          </F.FormRow>

          <F.FormHint>
            Указывайте новый путь только после переноса всей папки: записи
            истории будут перенаправлены на новые файлы. Если файлы не найдены,
            изменение отменится.
          </F.FormHint>

          <F.FormActions>
            <Button
              type="button"
              $variant="primary"
              $size="sm"
              disabled={busy !== null}
              onClick={onSaveEdit}
            >
              {isBusy ? "Сохранение..." : "Сохранить"}
            </Button>

            <Button
              type="button"
              $variant="secondary"
              $size="sm"
              disabled={busy !== null}
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
          </F.FormActions>
        </F.StorageInlineForm>
      ) : (
        <S.StorageActions>
          {!info.is_active && (
            <Button
              type="button"
              $variant="primary"
              $size="sm"
              disabled={busy !== null}
              onClick={onActivate}
            >
              {isBusy ? "Переключение..." : "Сделать активным"}
            </Button>
          )}

          <Button
            type="button"
            $variant="secondary"
            $size="sm"
            disabled={busy !== null}
            onClick={onStartEdit}
          >
            Изменить
          </Button>

          {!info.is_active && (
            <Button
              type="button"
              $variant="dangerSoft"
              $size="sm"
              disabled={busy !== null}
              onClick={onDelete}
            >
              Удалить
            </Button>
          )}
        </S.StorageActions>
      )}
    </S.StorageCard>
  );
}
