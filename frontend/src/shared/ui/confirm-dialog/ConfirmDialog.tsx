import { useEffect } from "react";

import {
  Actions,
  CancelButton,
  ConfirmButton,
  Dialog,
  Message,
  Overlay,
  Title,
} from "./ConfirmDialog.styles";

type ConfirmDialogProps = {
  open: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  loadingText?: string;

  loading?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  loadingText = "Подождите...",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <Overlay
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Title id="confirm-dialog-title">{title}</Title>

        <Message>{message}</Message>

        <Actions>
          <CancelButton type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </CancelButton>

          <ConfirmButton type="button" onClick={onConfirm} disabled={loading}>
            {loading ? loadingText : confirmText}
          </ConfirmButton>
        </Actions>
      </Dialog>
    </Overlay>
  );
}
