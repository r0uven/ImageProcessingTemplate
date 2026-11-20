import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
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
  FeaturesHint,
} from "./WorkspacePage.styles";
import {
  uploadImage,
  uploadImageByPath,
} from "@/api/image/uploadImage";
import { buildMediaUrl } from "@/api/client";
import type { UploadResponse } from "@/api/types";
import { ProcessingSettings } from "./widgets/ProcessingSettings";
import { formatToAccept } from "./util/textFormatter";
import { analyzeImage } from "@/api/image/analysisApi";
import {
  createRunFingerprint,
  useWorkspaceState,
  type WorkspaceMode,
  type WorkspaceState,
} from "./workspaceStore";

export function WorkspacePage() {
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId: string }>();
  const { state, update } = useWorkspaceState(toolId);

  const { mode, viewerState, processingSettings, runId, runFingerprint } = state;

  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function setMode(nextMode: WorkspaceMode) {
    update((prev) => ({ ...prev, mode: nextMode }));
  }

  function setProcessingSettings(
    updater: (
      previous: WorkspaceState["processingSettings"],
    ) => WorkspaceState["processingSettings"],
  ) {
    update((prev) => ({
      ...prev,
      processingSettings: updater(prev.processingSettings),
    }));
  }

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

  async function handleUpload() {
    // В браузере нативный диалог Tauri недоступен — оставляем обычный выбор файла.
    if (!isTauri()) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Изображения",
            extensions: settings.image.allowed_formats,
          },
        ],
      });

      if (typeof selected !== "string") return;

      const result = await uploadImageByPath(selected);
      applyUploadedImage(result);
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Проверьте консоль.");
    }
  }

  async function handleFileInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file);
      applyUploadedImage(result);
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Проверьте консоль.");
    } finally {
      e.target.value = "";
    }
  }

  const accept = formatToAccept(settings.image.allowed_formats);

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

      update((prev) => ({
        ...prev,
        runId: result.run_id,
        runFingerprint: fingerprint,
        mode: "processed",
        viewerState: {
          ...prev.viewerState,
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
        },
      }));
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
                if (!runId || isRunOutdated) return;
                navigate(`/metrics/${runId}`);
              }}
              disabled={!runId || isRunOutdated || isProcessing}
            >
              Вычислить характеристики
            </FeaturesButton>

            {isRunOutdated && (
              <FeaturesHint>
                Настройки или изображение изменились — выполните обработку
                заново
              </FeaturesHint>
            )}
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
            <UploadOverlay
              role="button"
              tabIndex={0}
              onClick={handleUpload}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleUpload();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={accept}
                onClick={(event) => event.stopPropagation()}
                onChange={handleFileInputChange}
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
                {currentImage && (
                  <img
                    src={buildMediaUrl(currentImage.preview_url) ?? ""}
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
