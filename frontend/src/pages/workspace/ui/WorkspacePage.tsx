import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  analyzeImage,
  type UploadResponse,
} from "@/entities/analysis";
import { useAppSettings } from "@/entities/settings";
import {
  createRunFingerprint,
  useWorkspaceState,
  type WorkspaceMode,
  type WorkspaceState,
} from "@/entities/workspace";
import { useWorkspaceUpload } from "@/features/workspace-upload";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";
import { ProcessingSettings } from "@/widgets/processing-settings";
import { WorkspaceViewer } from "@/widgets/workspace-viewer";

import {
  ActionArea,
  Layout,
  LeftPanel,
  SettingsContent,
  ViewerPanel,
} from "./WorkspacePage.styles";
import { FeaturesHint } from "./WorkspaceActions.styles";

/** Страница обработки изображения выбранной моделью. */
export function WorkspacePage() {
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();
  const { settings } = useAppSettings();
  const { state, update } = useWorkspaceState(toolId, settings);

  const { mode, viewerState, processingSettings, runId, runFingerprint } = state;

  const [isProcessing, setIsProcessing] = useState(false);

  function setMode(nextMode: WorkspaceMode) {
    update((prev) => ({ ...prev, mode: nextMode }));
  }

  function setProcessingSettings(
    updater: (
      previous: WorkspaceState["processingSettings"],
    ) => WorkspaceState["processingSettings"],
  ) {
    // Настройки хранятся в общем сторе, поэтому обновляем их через update.
    update((prev) => ({
      ...prev,
      processingSettings: updater(prev.processingSettings),
    }));
  }

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

  function applyUploadedImage(result: UploadResponse) {
    // Новое изображение — прежний запуск больше не соответствует входным данным.
    update((prev) => ({
      ...prev,
      mode: "original",
      viewerState: {
        original: {
          preview_url: result.preview_url,
          image_id: result.image_id,
          width: result.width,
          height: result.height,
        },
        processed: null,
        annotated: null,
      },
      runId: null,
      runFingerprint: null,
    }));
  }

  const { fileInputRef, accept, handleUpload, handleFileInputChange } =
    useWorkspaceUpload({
      allowedFormats: settings.image.allowed_formats,
      onUploaded: applyUploadedImage,
    });

  function clearImage() {
    update((prev) => ({
      ...prev,
      mode: "original",
      viewerState: {
        original: null,
        processed: null,
        annotated: null,
      },
      runId: null,
      runFingerprint: null,
    }));
  }

  const currentFingerprint = useMemo(
    // Отпечаток позволяет понять, соответствует ли сохранённый runId текущим данным.
    () =>
      createRunFingerprint(
        viewerState.original?.image_id ?? null,
        processingSettings,
      ),
    [viewerState.original?.image_id, processingSettings],
  );

  // Настройки или изображение изменились после обработки — старый запуск
  // больше не соответствует тому, что пользователь видит на экране.
  const isRunOutdated = runId !== null && runFingerprint !== currentFingerprint;

  const handleProcess = async () => {
    if (!viewerState.original) return;

    const imageId = viewerState.original.image_id;
    const fingerprint = createRunFingerprint(imageId, processingSettings);

    try {
      setIsProcessing(true);

      const result = await analyzeImage(imageId, {
        parametersId: crypto.randomUUID(),
        modelId: toolId || "default_model",
        ...processingSettings,
      });

      // Какие изображения сохранять, решает analysis_pipeline в settings.json.
      // Если результат отключён, показываем наиболее подходящий сохранённый.
      const originalPreview = viewerState.original.preview_url;
      const processedPreview =
        result.postprocessed_mask ??
        result.segmentation_mask ??
        result.preprocessed_image ??
        originalPreview;
      const annotatedPreview = result.detection_overlay ?? processedPreview;

      update((prev) => ({
        ...prev,
        runId: result.run_id,
        runFingerprint: fingerprint,
        mode: "processed",
        viewerState: {
          ...prev.viewerState,
          processed: {
            preview_url: processedPreview,
            image_id: result.image_id,
            width: result.width,
            height: result.height,
          },
          annotated: {
            preview_url: annotatedPreview,
            image_id: result.image_id,
            width: result.width,
            height: result.height,
          },
        },
      }));
    } catch (cause) {
      console.error(cause);
      alert("Ошибка при обработке изображения. Проверьте консоль.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasImage = Boolean(viewerState.original || viewerState.processed);
  // Для каждого режима показываем своё изображение, подставляя оригинал как fallback.
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
            <Button
              $variant="primary"
              $size="lg"
              $fullWidth
              onClick={handleProcess}
              disabled={isProcessing || !viewerState.original}
            >
              {isProcessing ? "Обработка..." : "Обработать"}
            </Button>

            <Button
              $variant="secondary"
              $size="lg"
              $fullWidth
              onClick={() => {
                if (!runId || isRunOutdated) return;
                navigate(`/metrics/${runId}`);
              }}
              disabled={!runId || isRunOutdated || isProcessing}
            >
              Вычислить характеристики
            </Button>

            {isRunOutdated && (
              <FeaturesHint>
                Настройки или изображение изменились — выполните обработку
                заново
              </FeaturesHint>
            )}
          </ActionArea>
        </LeftPanel>

        <ViewerPanel>
          <WorkspaceViewer
            mode={mode}
            hasImage={hasImage}
            currentImage={currentImage}
            accept={accept}
            fileInputRef={fileInputRef}
            onModeChange={setMode}
            onClear={clearImage}
            onUpload={handleUpload}
            onFileInputChange={handleFileInputChange}
          />
        </ViewerPanel>
      </Layout>
    </Page>
  );
}
