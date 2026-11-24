from app.config.config_loader import APP_SETTINGS
from app.pipeline.pipeline_context import PipelineContext


class FeatureExtractor:
    def extract(self, context: PipelineContext) -> PipelineContext:
        settings = APP_SETTINGS["feature_extraction"]
        summary_settings = settings["summary_statistics"]

        objects = context.objects

        if objects is None:
            raise ValueError("Objects have not been detected yet")

        # =========================================================
        # Areas and Diameters
        # =========================================================

        pore_areas = []
        pore_diameters = []

        for obj in objects:
            pore_areas.append(obj.area)
            pore_diameters.append(obj.equivalent_diameter)

        pore_count = len(objects)

        mean_area = sum(pore_areas) / pore_count if pore_count else 0.0
        mean_diameter = sum(pore_diameters) / pore_count if pore_count else 0.0

        # Пересчёт пикселей в метрические единицы, если задан масштаб.
        scale = (
            float(settings["scale_mm_per_pixel"])
            if settings["use_scale"] and settings["scale_mm_per_pixel"] is not None
            else None
        )
        if scale is not None:
            pore_areas = [area * scale**2 for area in pore_areas]
            pore_diameters = [diameter * scale for diameter in pore_diameters]
            mean_area *= scale**2
            mean_diameter *= scale

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

        # Количество обнаруженных объектов всегда нужно интерфейсу.
        context.analysis_result.pore_count = pore_count

        if not settings["calculate_summary_statistics"]:
            return context

        if summary_settings["mean_area"]:
            context.analysis_result.area = mean_area
            context.analysis_result.diameter = mean_diameter

        if summary_settings["porosity"]:
            context.analysis_result.porosity = porosity

        # =========================================================
        # Size distribution
        # =========================================================

        if summary_settings["size_distribution"]:
            context.analysis_result.size_distribution = {
                "count": pore_count,
                "areas": pore_areas,
                "diameters": pore_diameters,
            }
        else:
            context.analysis_result.size_distribution = {}

        return context
