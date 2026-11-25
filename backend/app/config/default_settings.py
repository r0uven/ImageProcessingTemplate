"""Глобальные настройки приложения по умолчанию.

Это эталон, из которого backend создаёт ``settings.json``, если файл удалён,
пуст или повреждён. Рабочая копия настроек хранится в ``settings.json`` рядом
с этим модулем; при добавлении новых полей обновляйте оба места.
"""

from copy import deepcopy
from typing import Any

DEFAULT_SETTINGS: dict[str, Any] = {
    "image": {
        "allowed_formats": ["png", "bmp", "tif", "tiff"],
        "allowed_sizes": [[512, 512], [1024, 1024], [2048, 2048]],
        "default_size": [1024, 1024],
        "grayscale": False,
        "pixel_value_range": [0, 255],
        "resize_on_load": False,
    },
    "preprocessing": {
        "denoise": True,
        "normalize": True,
        "contrast_enhancement": False,
        "smoothing": False,
        "filter_size": 3,
        "preserve_size": True,
    },
    "segmentation": {
        "method": "threshold",
        "output": {
            "foreground_value": 1,
            "background_value": 0,
            "preserve_size": True,
        },
        "threshold": {
            "threshold_value": 128,
            "invert": False,
        },
        "neural": {
            "selected_model": None,
            "entities": {},
            "default_confidence_threshold": 0.5,
            "device": "cpu",
        },
    },
    "postprocessing": {
        "remove_small_objects": True,
        "min_object_area": 20,
        "fill_holes": True,
        "morphology": {
            "enabled": True,
            "operation": "closing",
            "kernel_size": 3,
        },
        "preserve_size": True,
    },
    "object_detection": {
        "connectivity": 8,
        "min_object_area": 20,
        "return_bounding_box": True,
        "return_centroid": True,
        "return_object_mask": False,
    },
    "object_classification": {
        "classification_mode": "detect_separation_candidates",
        "candidate_rules": {
            "max_area": None,
            "min_roundness": None,
            "max_eccentricity": None,
            "min_solidity": None,
            "min_extent": None,
        },
        "features": {
            "use_area": True,
            "use_roundness": True,
            "use_eccentricity": True,
            "use_solidity": True,
            "use_extent": True,
        },
    },
    "pore_separation": {
        "enabled": True,
        "apply_only_to_candidates": True,
        "preserve_autonomous_pores": True,
        "keep_unseparated_candidates": True,
        "validate_separation_result": True,
        "preserve_parent_link": True,
        "evaluate_separation_quality": True,
        "quality_metrics": {
            "covered_area": True,
            "lost_area": True,
            "extra_area": True,
            "coverage_ratio": True,
            "extra_ratio": False,
        },
        "algorithm_params": {},
    },
    "pore_merging": {
        "preserve_object_status": True,
        "preserve_parent_object_id": True,
        "preserve_separation_quality_metrics": True,
        "include_autonomous_pores": True,
        "include_separated_objects": True,
        "include_unseparated_candidates": True,
        "object_statuses": [
            "autonomous",
            "separated",
            "unseparated_candidate",
        ],
    },
    "feature_extraction": {
        "calculate_object_features": True,
        "calculate_summary_statistics": True,
        "preserve_object_status": True,
        "preserve_parent_object_id": True,
        "include_separation_quality_metrics": True,
        "use_status_based_feature_source": True,
        "use_scale": False,
        "scale_mm_per_pixel": None,
        "region_object_features": {
            "area": True,
            "perimeter": True,
            "centroid": True,
            "equivalent_diameter": True,
            "bounding_box": True,
            "roundness": True,
            "relative_area": True,
        },
        "circle_object_features": {
            "center": True,
            "radius": True,
            "diameter": True,
            "area": True,
            "circumference": True,
            "relative_area": True,
        },
        "separation_quality_metrics": {
            "covered_area": True,
            "lost_area": True,
            "extra_area": True,
            "coverage_ratio": True,
            "extra_ratio": False,
        },
        "summary_statistics": {
            "total_count": True,
            "count_by_status": True,
            "total_pore_area": True,
            "mean_area": True,
            "min_area": True,
            "max_area": True,
            "porosity": True,
            "size_distribution": True,
        },
    },
    "analysis_pipeline": {
        "save_intermediate_results": True,
        "save_run_parameters": True,
        "save_segmentation_mask": True,
        "save_postprocessed_mask": True,
        "save_classification_result": True,
        "save_separation_result": True,
        "save_final_objects": True,
        "save_features": True,
    },
    "storage": {
        "active_storage_id": "default",
        "storages": [
            {
                "id": "default",
                "path": "data/images",
                "label": "Основное хранилище",
                "created_at": None,
                "last_used_at": None,
            }
        ],
        "cache_max_age_days": 183,
        "cache_max_total_bytes": 10737418240,
        "cleanup_interval_minutes": 30,
        "cleanup_max_deletions_per_run": 25,
    },
    # TODO(training): раздел пока не используется backend-кодом. Нет обучения,
    # регистрации модели и записи результата в segmentation_models.
    "training": {
        "dataset_pair_format": "image_mask",
        "validate_image_mask_size": True,
        "allowed_image_formats": [".png", ".bmp", ".tif", ".tiff"],
        "allowed_mask_formats": [".png", ".bmp", ".tif", ".tiff"],
        "training_params": {
            "epochs": 100,
            "batch_size": 8,
            "learning_rate": 0.001,
            "architecture": None,
        },
        "model_registry": {
            "save_model_file": True,
            "register_model_in_config": True,
            "models_directory": "entities",
        },
        "metrics": {
            "dice": True,
            "iou": True,
            "pixel_accuracy": True,
        },
    },
}


def default_settings() -> dict[str, Any]:
    """Возвращает независимую копию настроек по умолчанию."""
    return deepcopy(DEFAULT_SETTINGS)
