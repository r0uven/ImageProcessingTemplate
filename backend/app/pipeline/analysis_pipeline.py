from app.modules.feature_extraction.feature_extractor import FeatureExtractor
from app.modules.object_detection.mock_detector import MockDetector
from app.modules.postprocessing.postprocessor import Postprocessor
from app.modules.preprocessing.preprocessor import Preprocessor
from app.modules.segmentation.threshold_segmenter import ThresholdSegmenter
from app.pipeline.pipeline_context import PipelineContext


class AnalysisPipeline:
    def __init__(self):
        self.detector = MockDetector()
        self.preprocessor = Preprocessor()
        self.postprocessor = Postprocessor()
        self.segmenter = ThresholdSegmenter()
        self.feature_extractor = FeatureExtractor()

    def run(self, context: PipelineContext) -> PipelineContext:

        print("Pipeline started")

        original_image = context.image_data.original_image

        # =========================================================
        # Preprocessing
        # =========================================================

        preprocessed_image = self.preprocessor.preprocess(original_image)

        context.image_data.preprocessed_image = preprocessed_image

        print("Preprocessing completed")

        # =========================================================
        # Segmentation
        # =========================================================

        segmentation_mask = self.segmenter.segment(preprocessed_image)

        print(segmentation_mask.shape)

        context.image_data.segmentation_mask = segmentation_mask

        print("Segmentation completed")

        # =========================================================
        # Postprocessing
        # =========================================================

        postprocessed_mask = self.postprocessor.postprocess(segmentation_mask)

        context.image_data.postprocessed_mask = postprocessed_mask

        print("Postprocessing completed")

        # =========================================================
        # Object detection
        # =========================================================

        detected_objects = self.detector.detect(postprocessed_mask)

        context.objects = detected_objects

        print(f"Detected objects: {len(detected_objects)}")

        # =========================================================
        # Feature extraction
        # =========================================================

        self.feature_extractor.extract(context)

        print("Feature extraction completed")

        print("Pipeline finished")

        return context
