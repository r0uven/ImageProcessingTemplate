import styled from "styled-components";

import { colors, radii, spacing, typography, zIndex } from "@/shared/styles/tokens";

export const UploadIcon = styled.div`
  font-size: 120px;
  color: rgba(255, 255, 255, 0.15);
  margin-bottom: ${spacing.lg}px;
`;

export const UploadText = styled.div`
  font-size: ${typography.sizes.h2}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.textSecondary};
`;

export const UploadHint = styled.div`
  margin-top: ${spacing.sm + 2}px;
  font-size: ${typography.sizes.md + 1}px;
  color: ${colors.textDim};
`;

export const ViewerHeader = styled.div`
  position: absolute;
  top: ${spacing.xl}px;
  right: ${spacing.xl}px;
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
  z-index: ${zIndex.toolbar};
`;

export const UploadOverlay = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.01);
  }
`;

export const ImageWrapper = styled.div`
  flex: 1;
  padding: ${spacing.xxl}px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: ${radii.sm - 2}px;
  }
`;

export const ToolBar = styled.div`
  position: absolute;
  bottom: ${spacing.xl}px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${spacing.sm + 2}px;
  padding: ${spacing.sm + 2}px;
  border-radius: ${radii.xl}px;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid ${colors.borderFaint};
`;
