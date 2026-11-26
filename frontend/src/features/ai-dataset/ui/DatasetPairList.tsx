import type { ChangeEvent } from "react";

import type { DatasetPair } from "../model/useDatasetPairs";
import * as S from "./DatasetUploader.styles";

type DatasetPairListProps = {
  pairs: DatasetPair[];
  imageFormats: string[];
  maskFormats: string[];
  onOriginalChange: (
    pairId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onMaskChange: (pairId: string, event: ChangeEvent<HTMLInputElement>) => void;
};

/** Список пар «изображение + маска» с превью и загрузкой файлов. */
export function DatasetPairList({
  pairs,
  imageFormats,
  maskFormats,
  onOriginalChange,
  onMaskChange,
}: DatasetPairListProps) {
  return (
    <S.DatasetContainer>
      {pairs.map((pair, index) => (
        <S.DatasetPair key={pair.id}>
          <S.PairHeader>
            <S.PairTitle>Пара изображений #{index + 1}</S.PairTitle>

            {pair.original && pair.mask && <S.PairReady>✓ Готово</S.PairReady>}
          </S.PairHeader>

          <S.UploadGrid>
            <div>
              {!pair.original ? (
                <S.UploadArea>
                  <S.UploadTitle>Исходное изображение</S.UploadTitle>

                  <S.UploadHint>Нажмите или перетащите файл</S.UploadHint>

                  <S.HiddenInput
                    type="file"
                    accept={imageFormats.join(",")}
                    onChange={(event) => onOriginalChange(pair.id, event)}
                  />
                </S.UploadArea>
              ) : (
                <S.PreviewImage src={pair.originalUrl} />
              )}
            </div>

            <div>
              {pair.original && !pair.mask && (
                <S.UploadArea>
                  <S.UploadTitle>Эталонная маска</S.UploadTitle>

                  <S.UploadHint>Нажмите или перетащите файл</S.UploadHint>

                  <S.HiddenInput
                    type="file"
                    accept={maskFormats.join(",")}
                    onChange={(event) => onMaskChange(pair.id, event)}
                  />
                </S.UploadArea>
              )}

              {pair.mask && <S.PreviewImage src={pair.maskUrl} />}
            </div>
          </S.UploadGrid>
        </S.DatasetPair>
      ))}
    </S.DatasetContainer>
  );
}
