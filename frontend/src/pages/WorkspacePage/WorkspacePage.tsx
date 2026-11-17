import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TrashSVG from "@/assets/TrashSVG.svg?react";
import settings from "../../../../backend/app/config/settings.json";

import {
  Page,
  Layout,
  LeftPanel,
  ViewerPanel,
  ToolBar,
  ToolButton,
  UploadOverlay,
  ImageWrapper,
  FeaturesButton,
  ActionArea,
  ProcessButton,
  SettingsContent,
  UploadHint,
  UploadIcon,
  UploadText,
  ViewerHeader,
  ModeSwitchContainer,
  ModeButton,
  ClearButton,
} from "./WorkspacePage.styles";
import { uploadImage } from "@/api/image/uploadImage";
import { ProcessingSettings } from "./widgets/ProcessingSettings";
import { formatToAccept } from "./util/textFormatter";
import { analyzeImage } from "@/api/image/analysisApi";
import type { UploadResponse } from "@/api/types";

type Mode = "original" | "processed" | "annotated";

type ViewerState = {
  original: UploadResponse | null;
  processed: UploadResponse | null;
  annotated: UploadResponse | null;
};

export function WorkspacePage() {
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();
  const [mode, setMode] = useState<Mode>("original");
  const [isProcessing, setIsProcessing] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const [viewerState, setViewerState] = useState<ViewerState>({
    original: null,
    processed: null,
    annotated: null,
  });

  const [processingSettings, setProcessingSettings] = useState({
    preprocessing: {
      denoise: settings.preprocessing.denoise,
      normalize: settings.preprocessing.normalize,
      contrastEnhancement: settings.preprocessing.contrast_enhancement,
      smoothing: settings.preprocessing.smoothing,
      filterSize: settings.preprocessing.filter_size,
      preserveSize: settings.preprocessing.preserve_size,
    },
    segmentation: {
      method: settings.segmentation.method,
      outputMask: {
        foregroundValue: settings.segmentation.output.foreground_value,
        backgroundValue: settings.segmentation.output.background_value,
        preserveSize: settings.segmentation.output.preserve_size,
      },
      threshold: {
        thresholdValue: settings.segmentation.threshold.threshold_value,
        invert: settings.segmentation.threshold.invert,
      },
      neural: {
        modelType: settings.segmentation.neural.selected_model,
        entities: settings.segmentation.neural.entities,
        defaultConfidenceThreshold:
          settings.segmentation.neural.default_confidence_threshold,
        device: settings.segmentation.neural.device,
      },
    },
    separation: {
      enabled: settings.pore_separation.enabled,
      applyOnlyToCandidates: settings.pore_separation.apply_only_to_candidates,
      preserveAutonomousPores:
        settings.pore_separation.preserve_autonomous_pores,
      keepUnseparatedCandidates:
        settings.pore_separation.keep_unseparated_candidates,
      validateSeparationResult:
        settings.pore_separation.validate_separation_result,
      preserveParentLink: settings.pore_separation.preserve_parent_link,
      evaluateSeparationQuality:
        settings.pore_separation.evaluate_separation_quality,
      qualityMetrics: {
        coveredArea: settings.pore_separation.quality_metrics.covered_area,
        lostArea: settings.pore_separation.quality_metrics.lost_area,
        extraArea: settings.pore_separation.quality_metrics.extra_area,
        coverageRatio: settings.pore_separation.quality_metrics.coverage_ratio,
        extraRatio: settings.pore_separation.quality_metrics.extra_ratio,
      },
      algorithmParams: settings.pore_separation.algorithm_params,
    },
  });

  const hasImage = Boolean(viewerState.original || viewerState.processed);

  function updateSection<T extends keyof typeof processingSettings>(
    section: T,
    field: keyof (typeof processingSettings)[T],
    value: unknown,
  ) {
    setProcessingSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file);

    setViewerState({
      original: {
        preview_url: result.preview_url,
        image_id: result.image_id,
        width: result.width,
        height: result.height,
      },
      processed: null,
      annotated: null,
    });
  }

  const accept = formatToAccept(settings.image.allowed_formats);

  function clearImage() {
    setViewerState({
      original: null,
      processed: null,
      annotated: null,
    });

    setMode("original");
    setRunId(null);
  }

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      if (!viewerState.original) return;

      const result = await analyzeImage(viewerState.original.image_id, {
        parametersId: crypto.randomUUID(),
        modelId: toolId || "default_model",
        ...processingSettings,
      });

      setRunId(result.run_id);

      setViewerState((prev) => ({
        ...prev,
        processed: {
          preview_url: result.postprocessed_mask,
          image_id: result.image_id,
          width: result.width,
          height: result.height,
        },
        annotated: {
          preview_url: result.detection_overlay,
          image_id: result.image_id,
          width: result.width,
          height: result.height,
        },
      }));

      setMode("processed");
    } catch (e) {
      console.error(e);
      alert("Ошибка при обработке изображения. Проверьте консоль.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentImage = {
    original: viewerState.original,
    annotated: viewerState.annotated ?? viewerState.original,
    processed: viewerState.processed ?? viewerState.original,
  }[mode];

  return (
    <Page>
      <Layout>
        <LeftPanel>
          <SettingsContent>
            <ProcessingSettings
              preprocessing={processingSettings.preprocessing}
              segmentation={processingSettings.segmentation}
              separation={processingSettings.separation}
              onChange={updateSection}
            />
          </SettingsContent>

          <ActionArea>
            <ProcessButton
              onClick={handleProcess}
              disabled={isProcessing || !viewerState.original}
            >
              {isProcessing ? "Обработка..." : "Обработать"}
            </ProcessButton>

            <FeaturesButton
              onClick={() => {
                if (!runId) return;
                navigate(`/metrics/${runId}`);
              }}
              disabled={!runId}
            >
              Вычислить характеристики
            </FeaturesButton>
          </ActionArea>
        </LeftPanel>

        <ViewerPanel>
          <ViewerHeader>
            {hasImage && (
              <ClearButton onClick={clearImage}>
                <TrashSVG />
              </ClearButton>
            )}

            <ModeSwitchContainer>
              <ModeButton
                active={mode === "original"}
                onClick={() => setMode("original")}
              >
                Оригинал
              </ModeButton>

              <ModeButton
                active={mode === "processed"}
                onClick={() => setMode("processed")}
              >
                Результат
              </ModeButton>

              <ModeButton
                active={mode === "annotated"}
                onClick={() => setMode("annotated")}
              >
                Объекты
              </ModeButton>
            </ModeSwitchContainer>
          </ViewerHeader>

          {!hasImage ? (
            <UploadOverlay>
              <input
                type="file"
                hidden
                accept={accept}
                onChange={handleUpload}
              />

              <UploadIcon>+</UploadIcon>
              <UploadText>Нажмите для загрузки изображения</UploadText>
              <UploadHint>
                {accept.toUpperCase().replaceAll(".", "").replaceAll(",", ", ")}
              </UploadHint>
            </UploadOverlay>
          ) : (
            <>
              <ImageWrapper>
                {currentImage?.preview_url && (
                  <img
                    src={`${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001"}${currentImage.preview_url}`}
                    alt="workspace"
                  />
                )}
              </ImageWrapper>

              <ToolBar>
                <ToolButton>🖱</ToolButton>
                <ToolButton>✂</ToolButton>
                <ToolButton>🧹</ToolButton>
                <ToolButton>⊖</ToolButton>
              </ToolBar>
            </>
          )}
        </ViewerPanel>
      </Layout>
    </Page>
  );
}
