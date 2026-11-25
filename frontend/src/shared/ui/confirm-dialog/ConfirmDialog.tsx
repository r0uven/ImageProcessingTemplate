import { useEffect } from "react";

import { Button } from "@/shared/ui/button";

import {
  Actions,
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
          <Button
            type="button"
            $variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            $variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingText : confirmText}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
}
