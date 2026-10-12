from app.pipeline.pipeline_context import PipelineContext


class FeatureExtractor:
    def _calculate_area(self, obj): ...

    def _calculate_diameter(self, obj): ...

    def extract(self, context: PipelineContext) -> PipelineContext:

        objects = context.objects

        if objects is None:
            raise ValueError("Objects have not been detected yet")
        # =========================================================
        # Areas and Diameters
        # =========================================================

        pore_areas = []
        pore_diameters = []

        for obj in objects:
            area = self._calculate_area(obj)
            diameter = self._calculate_diameter(obj)

            pore_areas.append(area)
            pore_diameters.append(diameter)

        pore_count = len(objects)

        mean_area = sum(pore_areas) / pore_count if pore_count else 0

        mean_diameter = sum(pore_diameters) / pore_count if pore_count else 0

        # =========================================================
        # Porosity
        # =========================================================

        image = context.image_data.original_image

        image_area = image.shape[0] * image.shape[1]

        pore_area_sum = sum(pore_areas)

        porosity = pore_area_sum / image_area if image_area else 0

        # =========================================================
        # Analysis result
        # =========================================================

        context.analysis_result.pore_count = pore_count

        context.analysis_result.area = mean_area
        context.analysis_result.diameter = mean_diameter
        context.analysis_result.porosity = porosity

        # =========================================================
        # Size distribution
        # =========================================================

        context.analysis_result.size_distribution = {
            "count": pore_count,
            "areas": pore_areas,
            "diameters": pore_diameters,
        }

        return context
