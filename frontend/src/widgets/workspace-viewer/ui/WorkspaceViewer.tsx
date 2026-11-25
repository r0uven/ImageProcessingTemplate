import type { ChangeEvent, RefObject } from "react";

import type { UploadResponse } from "@/entities/analysis";
import type { WorkspaceMode } from "@/entities/workspace";
import { buildMediaUrl } from "@/shared/api/client";
import TrashSVG from "@/shared/assets/TrashSVG.svg?react";

import * as S from "./WorkspaceViewer.styles";

type WorkspaceViewerProps = {
  mode: WorkspaceMode;
  hasImage: boolean;
  currentImage: UploadResponse | null;
  accept: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onModeChange: (mode: WorkspaceMode) => void;
  onClear: () => void;
  onUpload: () => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function WorkspaceViewer({
  mode,
  hasImage,
  currentImage,
  accept,
  fileInputRef,
  onModeChange,
  onClear,
  onUpload,
  onFileInputChange,
}: WorkspaceViewerProps) {
  return (
    <>
      <S.ViewerHeader>
        {hasImage && (
          <S.ClearButton onClick={onClear}>
            <TrashSVG />
          </S.ClearButton>
        )}

        <S.ModeSwitchContainer>
          <S.ModeButton
            active={mode === "original"}
            onClick={() => onModeChange("original")}
          >
            Оригинал
          </S.ModeButton>

          <S.ModeButton
            active={mode === "processed"}
            onClick={() => onModeChange("processed")}
          >
            Результат
          </S.ModeButton>

          <S.ModeButton
            active={mode === "annotated"}
            onClick={() => onModeChange("annotated")}
          >
            Объекты
          </S.ModeButton>
        </S.ModeSwitchContainer>
      </S.ViewerHeader>

      {!hasImage ? (
        <S.UploadOverlay
          role="button"
          tabIndex={0}
          onClick={onUpload}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onUpload();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept={accept}
            onClick={(event) => event.stopPropagation()}
            onChange={onFileInputChange}
          />

          <S.UploadIcon>+</S.UploadIcon>
          <S.UploadText>Нажмите для загрузки изображения</S.UploadText>
          <S.UploadHint>
            {accept.toUpperCase().replaceAll(".", "").replaceAll(",", ", ")}
          </S.UploadHint>
        </S.UploadOverlay>
      ) : (
        <>
          <S.ImageWrapper>
            {currentImage && (
              <img
                src={buildMediaUrl(currentImage.preview_url) ?? ""}
                alt="workspace"
              />
            )}
          </S.ImageWrapper>

          <S.ToolBar>
            <S.ToolButton>🖱</S.ToolButton>
            <S.ToolButton>✂</S.ToolButton>
            <S.ToolButton>🧹</S.ToolButton>
            <S.ToolButton>⊖</S.ToolButton>
          </S.ToolBar>
        </>
      )}
    </>
  );
}
