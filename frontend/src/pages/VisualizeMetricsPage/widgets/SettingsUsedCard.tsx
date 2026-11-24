import { useMemo, useState } from "react";

import type {
  SettingsSnapshotSection,
  SettingsSnapshotValue,
  SettingsUsed,
} from "@/api/types";
import { labelFor } from "@/settings/labels";
import * as S from "./SettingsUsedCard.styled";

type CardRow = {
  label: string;
  value: string;
  stacked?: boolean;
};

type CardGroup = {
  key: string;
  title: string;
  rows: CardRow[];
};

const OPERATION_LABELS: Record<string, string> = {
  closing: "замыкание",
  opening: "размыкание",
  erosion: "эрозия",
  dilation: "дилатация",
  gradient: "градиент",
  tophat: "tophat",
  blackhat: "blackhat",
};

const METHOD_LABELS: Record<string, string> = {
  threshold: "пороговая",
  neural: "нейросетевая",
};

function isSection(
  value: SettingsSnapshotValue | undefined,
): value is SettingsSnapshotSection {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPath(
  root: SettingsSnapshotSection | undefined,
  ...path: string[]
): SettingsSnapshotValue | undefined {
  let current: SettingsSnapshotValue | undefined = root;

  for (const key of path) {
    if (!isSection(current)) return undefined;
    current = current[key];
  }

  return current;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Number.isInteger(value)) return String(value);

  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPrimitive(value: SettingsSnapshotValue): string {
  if (value === null) return "—";
  if (Array.isArray(value)) return value.map(formatPrimitive).join("×");
  if (typeof value === "object") return "—";
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (typeof value === "number") return formatNumber(value);

  return String(value);
}

function formatValue(value: SettingsSnapshotValue | undefined): string {
  if (value === undefined) return "—";
  if (value === null) return "не задан";
  if (typeof value === "boolean") return value ? "вкл" : "выкл";
  if (typeof value === "number") return formatNumber(value);
  if (Array.isArray(value)) return value.length ? formatPrimitive(value) : "—";
  if (typeof value === "object") return "—";

  return OPERATION_LABELS[value] ?? METHOD_LABELS[value] ?? value;
}

function rows(
  specs: Array<[string, SettingsSnapshotValue | undefined]>,
): CardRow[] {
  return specs
    .filter(
      (spec): spec is [string, SettingsSnapshotValue] => spec[1] !== undefined,
    )
    .map(([label, value]) => ({ label: labelFor(label), value: formatValue(value) }));
}

function enabledLabels(value: SettingsSnapshotValue | undefined): string {
  if (!isSection(value)) return "—";

  const enabled = Object.entries(value)
    .filter(([, child]) => child === true)
    .map(([key]) => labelFor(key));

  return enabled.length ? enabled.join(", ") : "нет";
}

function buildGroups(data: SettingsUsed): CardGroup[] {
  const request = data.request ?? {};
  const global = data.global ?? {};
  const groups: CardGroup[] = [];

  const image = global.image;
  if (isSection(image)) {
    groups.push({
      key: "image",
      title: "Изображение",
      rows: rows([
        ["grayscale", getPath(image, "grayscale")],
        ["resize_on_load", getPath(image, "resize_on_load")],
        ["default_size", getPath(image, "default_size")],
        ["pixel_value_range", getPath(image, "pixel_value_range")],
      ]),
    });
  }

  const preprocessing = request.preprocessing;
  if (isSection(preprocessing)) {
    groups.push({
      key: "preprocessing",
      title: "Предобработка",
      rows: rows([
        ["denoise", getPath(preprocessing, "denoise")],
        ["normalize", getPath(preprocessing, "normalize")],
        ["contrast_enhancement", getPath(preprocessing, "contrast_enhancement")],
        ["smoothing", getPath(preprocessing, "smoothing")],
        ["filter_size", getPath(preprocessing, "filter_size")],
        ["preserve_size", getPath(preprocessing, "preserve_size")],
      ]),
    });
  }

  const segmentation = request.segmentation;
  if (isSection(segmentation)) {
    groups.push({
      key: "segmentation",
      title: "Сегментация",
      rows: rows([
        ["method", getPath(segmentation, "method")],
        ["threshold_value", getPath(segmentation, "threshold", "threshold_value")],
        ["invert", getPath(segmentation, "threshold", "invert")],
        [
          "foreground_value",
          getPath(segmentation, "output_mask", "foreground_value"),
        ],
        [
          "background_value",
          getPath(segmentation, "output_mask", "background_value"),
        ],
        ["preserve_size", getPath(segmentation, "output_mask", "preserve_size")],
      ]),
    });
  }

  const postprocessing = global.postprocessing;
  if (isSection(postprocessing)) {
    groups.push({
      key: "postprocessing",
      title: "Постобработка",
      rows: rows([
        ["remove_small_objects", getPath(postprocessing, "remove_small_objects")],
        ["min_object_area", getPath(postprocessing, "min_object_area")],
        ["fill_holes", getPath(postprocessing, "fill_holes")],
        ["morphology", getPath(postprocessing, "morphology", "enabled")],
        ["operation", getPath(postprocessing, "morphology", "operation")],
        ["kernel_size", getPath(postprocessing, "morphology", "kernel_size")],
        ["preserve_size", getPath(postprocessing, "preserve_size")],
      ]),
    });
  }

  const detection = global.object_detection;
  if (isSection(detection)) {
    groups.push({
      key: "object_detection",
      title: "Обнаружение объектов",
      rows: rows([
        ["connectivity", getPath(detection, "connectivity")],
        ["min_object_area", getPath(detection, "min_object_area")],
        ["return_bounding_box", getPath(detection, "return_bounding_box")],
        ["return_centroid", getPath(detection, "return_centroid")],
        ["return_object_mask", getPath(detection, "return_object_mask")],
      ]),
    });
  }

  const features = global.feature_extraction;
  if (isSection(features)) {
    const useScale = getPath(features, "use_scale");
    const featureRows = rows([
      ["use_scale", useScale],
      [
        "scale_mm_per_pixel",
        useScale === true ? getPath(features, "scale_mm_per_pixel") : "не используется",
      ],
      ["calculate_object_features", getPath(features, "calculate_object_features")],
      [
        "calculate_summary_statistics",
        getPath(features, "calculate_summary_statistics"),
      ],
      [
        "use_status_based_feature_source",
        getPath(features, "use_status_based_feature_source"),
      ],
    ]);

    for (const key of [
      "region_object_features",
      "circle_object_features",
      "summary_statistics",
      "separation_quality_metrics",
    ]) {
      const nested = getPath(features, key);
      if (isSection(nested)) {
        featureRows.push({
          label: labelFor(key),
          value: enabledLabels(nested),
          stacked: true,
        });
      }
    }

    groups.push({
      key: "feature_extraction",
      title: "Характеристики",
      rows: featureRows,
    });
  }

  return groups;
}

function joinParts(parts: Array<string | null>): string {
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length ? filtered.join(" · ") : "—";
}

function buildSummary(data: SettingsUsed): CardRow[] {
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
        getPath(postprocessing, "fill_holes") === true
          ? "заливка пустот"
          : null,
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

type SettingsUsedCardProps = {
  data: SettingsUsed | null;
};

export function SettingsUsedCard({ data }: SettingsUsedCardProps) {
  const [expanded, setExpanded] = useState(false);

  const groups = useMemo(() => (data ? buildGroups(data) : []), [data]);
  const summary = useMemo(() => (data ? buildSummary(data) : []), [data]);

  if (!data) {
    return (
      <S.Card>
        <S.TitleWrap>
          <S.Title>Параметры обработки</S.Title>
        </S.TitleWrap>

        <S.Note>Для этого запуска параметры не сохранялись.</S.Note>
      </S.Card>
    );
  }

  return (
    <S.Card>
      <S.TopRow>
        <S.TitleWrap>
          <S.Title>Параметры обработки</S.Title>
          <S.Badge>
            {data.complete ? "снимок на момент запуска" : "частичные данные"}
          </S.Badge>
        </S.TitleWrap>

        {groups.length > 0 && (
          <S.ToggleButton
            type="button"
            $expanded={expanded}
            aria-expanded={expanded}
            onClick={() => setExpanded((previous) => !previous)}
          >
            {expanded ? "Свернуть" : "Подробнее"}
            <S.Chevron $expanded={expanded}>▾</S.Chevron>
          </S.ToggleButton>
        )}
      </S.TopRow>

      {summary.length > 0 && (
        <S.Summary>
          {summary.map((row) => (
            <S.SummaryRow key={row.label}>
              <S.SummaryLabel>{row.label}</S.SummaryLabel>
              <S.SummaryValue>{row.value}</S.SummaryValue>
            </S.SummaryRow>
          ))}
        </S.Summary>
      )}

      {expanded && groups.length > 0 && (
        <S.Groups>
          {groups.map((group) => (
            <S.Group key={group.key}>
              <S.GroupTitle>{group.title}</S.GroupTitle>

              <S.GroupRows>
                {group.rows.map((row, index) => (
                  <S.Row
                    key={`${group.key}:${row.label}:${index}`}
                    $stacked={row.stacked}
                  >
                    <S.RowLabel>{row.label}</S.RowLabel>
                    <S.RowValue $stacked={row.stacked}>{row.value}</S.RowValue>
                  </S.Row>
                ))}
              </S.GroupRows>
            </S.Group>
          ))}
        </S.Groups>
      )}

      {!data.complete && (
        <S.Note>
          Глобальные настройки (изображение, постобработка, обнаружение и
          характеристики) для этого запуска не сохранялись — показаны только
          параметры обработки.
        </S.Note>
      )}
    </S.Card>
  );
}
