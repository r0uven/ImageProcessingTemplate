"""Извлечение числовых характеристик из обнаруженных объектов."""

from app.config.config_loader import APP_SETTINGS
from app.pipeline.pipeline_context import PipelineContext


class FeatureExtractor:
    """Считает площади, диаметры, пористость и таблицу пор."""

    def extract(self, context: PipelineContext) -> PipelineContext:
        """Дополняет ``context.analysis_result`` метриками по найденным порам."""
        settings = APP_SETTINGS["feature_extraction"]

        objects = context.objects

        if objects is None:
            raise ValueError("Objects have not been detected yet")

        # =========================================================
        # Areas, radii and centers
        # =========================================================

        # Пересчёт пикселей в метрические единицы, если задан масштаб.
        scale = (
            float(settings["scale_mm_per_pixel"])
            if settings["use_scale"] and settings["scale_mm_per_pixel"] is not None
            else None
        )
        length_unit = "мм" if scale is not None else "px"
        area_unit = "мм²" if scale is not None else "px²"

        pore_areas = []
        pore_diameters = []
        pore_rows = []

        for obj in objects:
            area = obj.area * scale**2 if scale is not None else obj.area
            diameter = (
                obj.equivalent_diameter * scale
                if scale is not None
                else obj.equivalent_diameter
            )
            equivalent_radius = diameter / 2

            # regionprops возвращает центроид как (строка, столбец), а в
            # таблице результатов координаты привычнее видеть как (x, y).
            center_x = float(obj.centroid[1]) if obj.centroid is not None else None
            center_y = float(obj.centroid[0]) if obj.centroid is not None else None

            pore_areas.append(area)
            pore_diameters.append(diameter)
            pore_rows.append(
                {
                    "object_id": obj.object_id,
                    "area": float(area),
                    "equivalent_radius": float(equivalent_radius),
                    "center_x": center_x,
                    "center_y": center_y,
                }
            )

        pore_count = len(objects)

        mean_area = sum(pore_areas) / pore_count if pore_count else 0.0
        mean_diameter = sum(pore_diameters) / pore_count if pore_count else 0.0

        # =========================================================
        # Porosity
        # =========================================================

        image = context.image_data.original_image
        image_area = image.shape[0] * image.shape[1]
        if scale is not None:
            image_area *= scale**2
        pore_area_sum = sum(pore_areas)
        porosity = pore_area_sum / image_area if image_area else 0.0

        # =========================================================
        # Analysis result
        # =========================================================

        # Базовый набор метрик нужен интерфейсу всегда, поэтому он
        # сохраняется независимо от дополнительных настроек статистики.
        context.analysis_result.pore_count = pore_count
        context.analysis_result.area = mean_area
        context.analysis_result.diameter = mean_diameter
        context.analysis_result.porosity = porosity

        context.analysis_result.size_distribution = {
            "count": pore_count,
            "areas": pore_areas,
            "diameters": pore_diameters,
            "total_area": pore_area_sum,
            "image_area": image_area,
            "porosity": porosity,
            "pores": pore_rows,
            "length_unit": length_unit,
            "area_unit": area_unit,
            "coordinates_unit": "px",
        }

        return context
