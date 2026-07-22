import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { analyzeImage } from "@/api/image/analysisApi";
import type { UploadResponse } from "@/api/types";

type Mode = "original" | "processed";

type ViewerState = {
  original: UploadResponse | null;
  processed: UploadResponse | null;
};

export function WorkspacePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("original");
  const [isProcessing, setIsProcessing] = useState(false);

  const [viewerState, setViewerState] = useState<ViewerState>({
    original: null,
    processed: null,
  });
  const [processingSettings, setProcessingSettings] = useState({
    preprocessing: {
      denoise: settings.preprocessing.denoise,
      normalize: settings.preprocessing.normalize,
      contrastEnhancement: settings.preprocessing.contrast_enhancement,
      smoothing: settings.preprocessing.smoothing,
      filterSize: settings.preprocessing.filter_size,
    },

    postprocessing: {
      removeSmallObjects: settings.postprocessing.remove_small_objects,
      minObjectArea: settings.postprocessing.min_object_area,
      fillHoles: settings.postprocessing.fill_holes,
      morphologyEnabled: settings.postprocessing.morphology.enabled,
      morphologyOperation: settings.postprocessing.morphology.operation,
      kernelSize: settings.postprocessing.morphology.kernel_size,
    },

    objectDetection: {
      connectivity: settings.object_detection.connectivity as 4 | 8,
      minObjectArea: settings.object_detection.min_object_area,
    },

    poreSeparation: {
      enabled: true,
      validateResult: settings.pore_separation.validate_separation_result,
      keepUnseparated: settings.pore_separation.keep_unseparated_candidates,
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

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(file);

    setViewerState({
      original: {
        preview_url: result.preview_url,
        image_id: result.image_id,
        width: result.width,
        height: result.height,
      },
      processed: null,
    });
  }

  const accept = formatToAccept(settings.image.allowed_formats);

  function clearImage() {
    setViewerState({
      original: null,
      processed: null,
    });

    setMode("original");
  }

  const handleProcess = async () => {
    try {
      setIsProcessing(true);

      const result = await analyzeImage(viewerState.original?.preview_url);

      setViewerState((prev) => ({
        ...prev,
        processed: {
          preview_url: result.preprocessed_image,
          image_id: result.image_id,
          width: result.width,
          height: result.height,
        },
      }));

      setMode("processed");
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentImage =
    mode === "original"
      ? viewerState.original
      : (viewerState.processed ?? viewerState.original);

  return (
    <Page>
      <Layout>
        <LeftPanel>
          <SettingsContent>
            <ProcessingSettings
              preprocessing={processingSettings.preprocessing}
              postprocessing={processingSettings.postprocessing}
              objectDetection={processingSettings.objectDetection}
              poreSeparation={processingSettings.poreSeparation}
              onChange={updateSection}
            />
          </SettingsContent>

          <ActionArea>
            <ProcessButton onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? "Обработка..." : "Обработать"}
            </ProcessButton>

            <FeaturesButton
              onClick={() => {
                navigate(`/metrics`);
              }}
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
                    src={`${import.meta.env.VITE_API_URL}${currentImage.preview_url}`}
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
