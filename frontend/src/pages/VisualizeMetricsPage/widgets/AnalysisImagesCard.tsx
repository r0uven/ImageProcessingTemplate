import { useState } from "react";

import { buildMediaUrl } from "@/api/client";
import type { AnalysisImage, AnalysisImageType } from "@/api/types";
import * as S from "./AnalysisImagesCard.styled";

const IMAGE_LABELS: Record<AnalysisImageType, string> = {
  original: "Оригинал",
  preprocessed: "Предобработка",
  segmentation: "Маска сегментации",
  postprocessed: "После обработки",
  overlay: "Оверлей",
};

const PREFERRED_ORDER: AnalysisImageType[] = [
  "overlay",
  "postprocessed",
  "segmentation",
  "preprocessed",
];

type AnalysisImagesCardProps = {
  images?: AnalysisImage[];
};

export function AnalysisImagesCard({ images = [] }: AnalysisImagesCardProps) {
  const [selected, setSelected] = useState<AnalysisImageType | null>(null);

  const active =
    images.find((image) => image.type === selected) ??
    PREFERRED_ORDER.map((type) =>
      images.find((image) => image.type === type),
    ).find(Boolean) ??
    images[0];

  if (!active) {
    return (
      <S.Card>
        <S.TitleBlock>
          <S.Title>Изображения обработки</S.Title>
        </S.TitleBlock>

        <S.Note>
          Изображения для этого запуска не сохранялись. Проверьте раздел
          «Сохранение результатов анализа» в настройках.
        </S.Note>
      </S.Card>
    );
  }

  const activeUrl = buildMediaUrl(active.url);

  return (
    <S.Card>
      <S.TopRow>
        <S.TitleBlock>
          <S.Title>Изображения обработки</S.Title>
          <S.Subtitle>Сохранённые этапы этого запуска</S.Subtitle>
        </S.TitleBlock>

        {activeUrl && (
          <S.OpenLink
            href={activeUrl}
            target="_blank"
            rel="noreferrer"
            title="Открыть изображение в новой вкладке"
          >
            Открыть в полном размере
          </S.OpenLink>
        )}
      </S.TopRow>

      {activeUrl && (
        <S.Viewer>
          <S.ViewerLink
            href={activeUrl}
            target="_blank"
            rel="noreferrer"
            title="Открыть изображение в новой вкладке"
          >
            <S.Preview
              src={activeUrl}
              alt={IMAGE_LABELS[active.type]}
              aria-label={IMAGE_LABELS[active.type]}
            />
          </S.ViewerLink>
        </S.Viewer>
      )}

      <S.Thumbnails>
        {images.map((image) => {
          const isActive = image.type === active.type;
          const url = buildMediaUrl(image.url);

          return (
            <S.ThumbButton
              key={image.type}
              type="button"
              $active={isActive}
              aria-pressed={isActive}
              onClick={() => setSelected(image.type)}
            >
              {url && <S.ThumbImage src={url} alt="" loading="lazy" />}
              <S.ThumbLabel>{IMAGE_LABELS[image.type]}</S.ThumbLabel>
            </S.ThumbButton>
          );
        })}
      </S.Thumbnails>
    </S.Card>
  );
}
