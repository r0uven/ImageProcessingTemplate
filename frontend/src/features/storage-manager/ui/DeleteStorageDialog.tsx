import type { StorageInfo } from "@/entities/settings";
import {
  Actions,
  CancelButton,
  ConfirmButton,
  Dialog,
  Message,
  Overlay,
  Title,
} from "@/shared/ui/confirm-dialog";

import { displayName } from "../lib/format";
import * as S from "./StorageForms.styles";

type DeleteStorageDialogProps = {
  target: StorageInfo | null;
  busy: string | null;
  deleteFiles: boolean;
  deleteHistory: boolean;
  onDeleteFilesChange: (value: boolean) => void;
  onDeleteHistoryChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteStorageDialog({
  target,
  busy,
  deleteFiles,
  deleteHistory,
  onDeleteFilesChange,
  onDeleteHistoryChange,
  onCancel,
  onConfirm,
}: DeleteStorageDialogProps) {
  if (!target) return null;

  const imageCount = target.image_count ?? 0;

  return (
    <Overlay
      onClick={() => {
        if (!busy) onCancel();
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
          Хранилище «{displayName(target)}» будет удалено из реестра.
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
                  onDeleteHistoryChange(event.target.checked)
                }
              />
              <span>Удалить изображения и связанную историю ({imageCount})</span>
            </S.CheckboxRow>
          )}

          <S.CheckboxRow>
            <S.Checkbox
              type="checkbox"
              checked={deleteFiles}
              onChange={(event) => onDeleteFilesChange(event.target.checked)}
            />
            <span>Удалить папку с диска безвозвратно</span>
          </S.CheckboxRow>
        </S.DialogChecks>

        {imageCount > 0 && !deleteHistory && (
          <S.DialogHint>
            Пока история ссылается на изображения, удалить хранилище нельзя.
            Отметьте первый пункт или сначала очистите историю.
          </S.DialogHint>
        )}

        <Actions>
          <CancelButton
            type="button"
            disabled={Boolean(busy)}
            onClick={onCancel}
          >
            Отмена
          </CancelButton>

          <ConfirmButton
            type="button"
            disabled={Boolean(busy) || (imageCount > 0 && !deleteHistory)}
            onClick={onConfirm}
          >
            {busy ? "Удаление..." : "Удалить"}
          </ConfirmButton>
        </Actions>
      </Dialog>
    </Overlay>
  );
}
