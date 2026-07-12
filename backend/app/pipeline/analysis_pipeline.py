from app.modules.preprocessing.preprocessor import Preprocessor
from app.modules.segmentation.threshold_segmenter import (
    ThresholdSegmenter
)
from app.modules.postprocessing.postprocessor import (
    Postprocessor
)
from app.modules.object_detection.mock_detector import (
    MockDetector
)

from app.pipeline.pipeline_context import PipelineContext


class AnalysisPipeline:

    def __init__(self):
        self.detector = MockDetector()
        self.preprocessor = Preprocessor()
        self.postprocessor = Postprocessor()
        self.segmenter = ThresholdSegmenter()

    def run(
        self,
        context: PipelineContext
    ) -> PipelineContext:

        print("Pipeline started")

        original_image = (
            context.image_data.original_image
        )

        preprocessed_image = (
            self.preprocessor.preprocess(
                original_image
            )
        )

        context.image_data.preprocessed_image = (
            preprocessed_image
        )

        print("Preprocessing completed")

        segmentation_mask = (
            self.segmenter.segment(
                preprocessed_image
            )
        )

        context.image_data.segmentation_mask = (
            segmentation_mask
        )

        print("Segmentation completed")

        postprocessed_mask = (
            self.postprocessor.postprocess(
                segmentation_mask
            )
        )

        context.image_data.postprocessed_mask = (
            postprocessed_mask
        )

        print("Postprocessing completed")

        detected_objects = (
            self.detector.detect(
                postprocessed_mask
            )
        )

        context.analysis_result.objects = (
            detected_objects
        )

        context.analysis_result.detected_objects_count = (
            len(detected_objects)
        )

        print(
            f"Detected objects: "
            f"{len(detected_objects)}"
        )

        print("Pipeline finished")

        return context