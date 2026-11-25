import type { SettingsUsed } from "@/entities/analysis";

import { formatNumber, formatValue, getPath, isSection } from "./format";
import type { CardRow } from "./types";

function joinParts(parts: Array<string | null>): string {
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length ? filtered.join(" · ") : "—";
}

export function buildSummary(data: SettingsUsed): CardRow[] {
  const request = data.request ?? {};
  const global = data.global ?? {};
  const summary: CardRow[] = [];

  const image = global.image;
  const preprocessing = request.preprocessing;
  const preparation: string[] = [];

  if (isSection(image)) {
    if (getPath(image, "grayscale") === true) {
      preparation.push("оттенки серого");
    }

    if (getPath(image, "resize_on_load") === true) {
      preparation.push(
        `приведение к ${formatValue(getPath(image, "default_size"))}`,
      );
    }
  }

  if (isSection(preprocessing)) {
    if (getPath(preprocessing, "denoise") === true) {
      preparation.push("шумоподавление");
    }
    if (getPath(preprocessing, "normalize") === true) {
      preparation.push("нормализация");
    }
    if (getPath(preprocessing, "contrast_enhancement") === true) {
      preparation.push("контраст");
    }
    if (getPath(preprocessing, "smoothing") === true) {
      preparation.push("сглаживание");
    }
  }

  if (preparation.length) {
    summary.push({ label: "Подготовка", value: preparation.join(" · ") });
  }

  const segmentation = request.segmentation;
  if (isSection(segmentation)) {
    const threshold = getPath(segmentation, "threshold", "threshold_value");
    const invert = getPath(segmentation, "threshold", "invert") === true;

    summary.push({
      label: "Сегментация",
      value: joinParts([
        formatValue(getPath(segmentation, "method")),
        threshold !== undefined ? `порог ${formatValue(threshold)}` : null,
        invert ? "с инверсией" : "без инверсии",
      ]),
    });
  }

  const postprocessing = global.postprocessing;
  if (isSection(postprocessing)) {
    const morphology = getPath(postprocessing, "morphology");
    const minArea = getPath(postprocessing, "min_object_area");
    let morphologyText = "морфология выкл";

    if (isSection(morphology) && getPath(morphology, "enabled") === true) {
      morphologyText = `${formatValue(
        getPath(morphology, "operation"),
      )} ${formatValue(getPath(morphology, "kernel_size"))} px`;
    }

    summary.push({
      label: "Постобработка",
      value: joinParts([
        minArea !== undefined
          ? `мин. площадь ${formatValue(minArea)} px²`
          : null,
        morphologyText,
        getPath(postprocessing, "fill_holes") === true ? "заливка пустот" : null,
      ]),
    });
  }

  const detection = global.object_detection;
  if (isSection(detection)) {
    const connectivity = getPath(detection, "connectivity");
    const minArea = getPath(detection, "min_object_area");

    summary.push({
      label: "Обнаружение",
      value: joinParts([
        connectivity !== undefined
          ? `связность ${formatValue(connectivity)}`
          : null,
        minArea !== undefined
          ? `мин. площадь ${formatValue(minArea)} px²`
          : null,
      ]),
    });
  }

  const features = global.feature_extraction;
  if (isSection(features)) {
    const useScale = getPath(features, "use_scale") === true;
    const scale = getPath(features, "scale_mm_per_pixel");

    summary.push({
      label: "Характеристики",
      value:
        useScale && typeof scale === "number"
          ? `масштаб ${formatNumber(scale)} мм/px`
          : "масштаб не используется (пиксели)",
    });
  }

  return summary;
}
