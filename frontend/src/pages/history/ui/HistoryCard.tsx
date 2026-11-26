import type { HistoryItemResponse } from "@/entities/history";
import { buildMediaUrl } from "@/shared/api/client";
import TrashSVG from "@/shared/assets/TrashSVG.svg?react";
import { Badge } from "@/shared/ui/badge";
import { Button, IconButton } from "@/shared/ui/button";

import * as C from "./HistoryCard.styles";

type HistoryCardProps = {
  item: HistoryItemResponse;
  onDelete: () => void;
  onView: () => void;
};

/** Карточка записи истории обработки. */
export function HistoryCard({ item, onDelete, onView }: HistoryCardProps) {
  const isSuccess = item.status === "SUCCESS";

  return (
    <C.HistoryCardRoot>
      <C.ImagePreview>
        {item.previewUrl ? (
          <img src={buildMediaUrl(item.previewUrl) ?? ""} alt="" />
        ) : (
          <C.NoPreview>Нет превью</C.NoPreview>
        )}
      </C.ImagePreview>

      <C.CardContent>
        <C.CardHeader>
          <C.FileName>{item.filename}</C.FileName>

          <C.CardActions>
            <Badge
              $variant={isSuccess ? "success" : "danger"}
              title={item.error ?? undefined}
            >
              {isSuccess ? "Успешно" : "Ошибка"}
            </Badge>

            <IconButton
              type="button"
              $variant="danger"
              title="Удалить запись"
              aria-label={`Удалить запись ${item.filename}`}
              onClick={onDelete}
            >
              <TrashSVG />
            </IconButton>
          </C.CardActions>
        </C.CardHeader>

        <C.InfoGrid>
          <C.InfoItem>
            <C.Label>Модель</C.Label>
            <C.Value>{item.modelName}</C.Value>
          </C.InfoItem>

          <C.InfoItem>
            <C.Label>Дата</C.Label>
            <C.Value>{item.createdAt}</C.Value>
          </C.InfoItem>

          <C.InfoItem>
            <C.Label>Размер</C.Label>
            <C.Value>
              {item.width} × {item.height}
            </C.Value>
          </C.InfoItem>

          <C.InfoItem>
            <C.Label>Время обработки</C.Label>
            <C.Value>{item.duration.toFixed(2)} сек.</C.Value>
          </C.InfoItem>
        </C.InfoGrid>

        {item.status === "FAILED" && item.error && (
          <C.FailureReason title={item.error}>{item.error}</C.FailureReason>
        )}

        <C.Actions>
          <Button
            $variant="primary"
            disabled={item.status === "FAILED"}
            onClick={onView}
          >
            {item.status === "FAILED"
              ? "Результат недоступен"
              : "Просмотреть результат"}
          </Button>
        </C.Actions>
      </C.CardContent>
    </C.HistoryCardRoot>
  );
}
