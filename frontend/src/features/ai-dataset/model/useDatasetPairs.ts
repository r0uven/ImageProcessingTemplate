import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import type { TrainingSettings } from "@/entities/settings";

import { validateMask } from "../lib/validateMask";

export interface DatasetPair {
  id: string;
  /** Исходное изображение и object URL для его превью. */
  original?: File;
  originalUrl?: string;
  /** Эталонная маска и object URL для её превью. */
  mask?: File;
  maskUrl?: string;
}

/** Проверяет расширение файла по списку разрешённых форматов. */
function hasAllowedExtension(filename: string, formats: string[]): boolean {
  const lower = filename.toLowerCase();
  return formats.some((format) => lower.endsWith(format.toLowerCase()));
}

export function useDatasetPairs(trainingSettings: TrainingSettings) {
  // Хук ведёт список пар «изображение + маска» и сам добавляет пустую пару,
  // когда предыдущая заполнена.
  const imageFormats = trainingSettings.allowed_image_formats;
  const maskFormats = trainingSettings.allowed_mask_formats;

  const [datasetPairs, setDatasetPairs] = useState<DatasetPair[]>([
    {
      id: crypto.randomUUID(),
    },
  ]);

  // Ссылка на актуальный список пар — нужна, чтобы при размонтировании
  // страницы освободить object URL загруженных файлов.
  const datasetPairsRef = useRef(datasetPairs);

  useEffect(() => {
    datasetPairsRef.current = datasetPairs;
  }, [datasetPairs]);

  useEffect(() => {
    return () => {
      for (const pair of datasetPairsRef.current) {
        if (pair.originalUrl) {
          URL.revokeObjectURL(pair.originalUrl);
        }

        if (pair.maskUrl) {
          URL.revokeObjectURL(pair.maskUrl);
        }
      }
    };
  }, []);

  const updateOriginal = (
    pairId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!hasAllowedExtension(file.name, imageFormats)) {
      alert(
        `Недопустимый формат изображения. Разрешены: ${imageFormats.join(", ")}`,
      );
      event.target.value = "";
      return;
    }

    const target = datasetPairs.find((pair) => pair.id === pairId);

    if (target?.originalUrl) {
      URL.revokeObjectURL(target.originalUrl);
    }

    const url = URL.createObjectURL(file);

    setDatasetPairs((prev) =>
      prev.map((pair) =>
        pair.id === pairId
          ? {
              ...pair,
              original: file,
              originalUrl: url,
            }
          : pair,
      ),
    );
  };

  const updateMask = async (
    pairId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!hasAllowedExtension(file.name, maskFormats)) {
      alert(`Недопустимый формат маски. Разрешены: ${maskFormats.join(", ")}`);
      event.target.value = "";
      return;
    }

    const target = datasetPairs.find((pair) => pair.id === pairId);

    // Размеры проверяются только если это включено в настройках обучения.
    const isValid = await validateMask(
      file,
      trainingSettings.validate_image_mask_size ? target?.original : undefined,
    );

    if (!isValid) {
      alert(
        "Эталонная маска должна быть черно-белым изображением того же размера, что и исходное.",
      );
      return;
    }

    if (target?.maskUrl) {
      URL.revokeObjectURL(target.maskUrl);
    }

    const url = URL.createObjectURL(file);

    setDatasetPairs((prev) => {
      const updated = prev.map((pair) =>
        pair.id === pairId
          ? {
              ...pair,
              mask: file,
              maskUrl: url,
            }
          : pair,
      );

      const last = updated[updated.length - 1];

      // Как только последняя пара заполнена, добавляем следующую пустую.
      if (last.original && last.mask) {
        updated.push({
          id: crypto.randomUUID(),
        });
      }

      return updated;
    });
  };

  const completedPairs = datasetPairs.filter(
    (pair) => pair.original && pair.mask,
  );

  return {
    datasetPairs,
    completedCount: completedPairs.length,
    updateOriginal,
    updateMask,
  };
}
