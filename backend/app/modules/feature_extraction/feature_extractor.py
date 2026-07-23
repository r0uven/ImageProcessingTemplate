from app.pipeline.pipeline_context import PipelineContext


class FeatureExtractor:

    def extract(
        self,
        context: PipelineContext
    ) -> PipelineContext:

        objects = context.analysis_result.objects

        pore_areas = [
            obj.area
            for obj in objects
        ]

        mean_area = (
            sum(pore_areas) / len(pore_areas)
            if pore_areas else 0
        )

        image = context.image_data.original_image

        image_area = (
            image.shape[0] *
            image.shape[1]
        )

        pore_area_sum = sum(pore_areas)

        porosity = (
            pore_area_sum / image_area
            if image_area else 0
        )

        context.analysis_result.mean_area = mean_area
        context.analysis_result.porosity = porosity

        return context