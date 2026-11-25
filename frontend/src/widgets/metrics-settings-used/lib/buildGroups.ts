import type { SettingsUsed } from "@/entities/analysis";
import { labelFor } from "@/entities/settings";

import { enabledLabels, getPath, isSection, rows } from "./format";
import type { CardGroup } from "./types";

export function buildGroups(data: SettingsUsed): CardGroup[] {
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
