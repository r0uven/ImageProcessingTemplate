import styled from "styled-components";

import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
  zIndex,
} from "@/shared/styles/tokens";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.dialog};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xxl}px;
  background: ${colors.overlay};
  backdrop-filter: blur(6px);
`;

export const Dialog = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 28px;
  border-radius: ${radii.xxl}px;
  border: 1px solid ${colors.borderFaint};
  background: ${colors.backgroundElevated};
  box-shadow: ${shadows.dialog};
  color: ${colors.text};
`;

export const Title = styled.h2`
  margin: 0 0 ${spacing.md + 2}px;
  font-size: ${typography.sizes.h2}px;
  font-weight: ${typography.weights.semibold};
`;

export const Message = styled.p`
  margin: 0 0 26px;
  font-size: ${typography.sizes.lg}px;
  line-height: ${typography.lineHeights.relaxed};
  color: ${colors.textMuted};
  overflow-wrap: anywhere;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.md}px;
`;
