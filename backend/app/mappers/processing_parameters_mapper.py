from app.entities.processing_parameters import (
    NeuralSegmentationParameters,
    OutputMaskParameters,
    PreprocessingParameters,
    ProcessingParameters,
    QualityMetricsParameters,
    SegmentationParameters,
    SeparationParameters,
    ThresholdSegmentationParameters,
)
from app.schemas.analyze_request import AnalyzeRequest


def to_processing_parameters(
    request: AnalyzeRequest,
) -> ProcessingParameters:

    return ProcessingParameters(
        parameters_id=request.parametersId,
        preprocessing=PreprocessingParameters(
            denoise=request.preprocessing.denoise,
            normalize=request.preprocessing.normalize,
            contrast_enhancement=request.preprocessing.contrastEnhancement,
            smoothing=request.preprocessing.smoothing,
            filter_size=request.preprocessing.filterSize,
            preserve_size=request.preprocessing.preserveSize,
        ),
        segmentation=SegmentationParameters(
            method=request.segmentation.method,
            output_mask=OutputMaskParameters(
                foreground_value=request.segmentation.outputMask.foregroundValue,
                background_value=request.segmentation.outputMask.backgroundValue,
                preserve_size=request.segmentation.outputMask.preserveSize,
            ),
            threshold=ThresholdSegmentationParameters(
                threshold_value=request.segmentation.threshold.thresholdValue,
                invert=request.segmentation.threshold.invert,
            ),
            neural=NeuralSegmentationParameters(
                model_id=request.segmentation.neural.modelType,
                entities=request.segmentation.neural.entities.copy(),
                default_confidence_threshold=(
                    request.segmentation.neural.defaultConfidenceThreshold
                ),
                device=request.segmentation.neural.device,
            ),
        ),
        separation=SeparationParameters(
            enabled=request.separation.enabled,
            apply_only_to_candidates=request.separation.applyOnlyToCandidates,
            preserve_autonomous_pores=request.separation.preserveAutonomousPores,
            keep_unseparated_candidates=request.separation.keepUnseparatedCandidates,
            validate_separation_result=request.separation.validateSeparationResult,
            preserve_parent_link=request.separation.preserveParentLink,
            evaluate_separation_quality=request.separation.evaluateSeparationQuality,
            quality_metrics=QualityMetricsParameters(
                covered_area=request.separation.qualityMetrics.coveredArea,
                lost_area=request.separation.qualityMetrics.lostArea,
                extra_area=request.separation.qualityMetrics.extraArea,
                coverage_ratio=request.separation.qualityMetrics.coverageRatio,
                extra_ratio=request.separation.qualityMetrics.extraRatio,
            ),
            algorithm_params=request.separation.algorithmParams.copy(),
        ),
    )
