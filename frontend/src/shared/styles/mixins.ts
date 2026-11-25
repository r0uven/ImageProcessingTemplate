import { css } from "styled-components";

import {
  colors,
  gradients,
  radii,
  shadows,
  transitions,
  typography,
} from "./tokens";

export const pageBackground = css`
  min-height: 100vh;
  background: ${gradients.page};
  color: ${colors.text};
`;

export const pageTitleText = css`
  margin: 0;
  font-size: ${typography.sizes.h1}px;
  font-weight: ${typography.weights.bold};
  letter-spacing: -1px;
  line-height: ${typography.lineHeights.tight};
`;

export const pageSubtitleText = css`
  color: ${colors.textMuted};
  font-size: ${typography.sizes.lg}px;
  line-height: ${typography.lineHeights.relaxed};
`;

export const cardTitleText = css`
  margin: 0;
  font-size: ${typography.sizes.h2}px;
  font-weight: ${typography.weights.semibold};
`;

export const sectionTitleText = css`
  margin: 0;
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.textSecondary};
`;

export const hintText = css`
  font-size: ${typography.sizes.sm}px;
  line-height: ${typography.lineHeights.normal};
  color: ${colors.textDim};
`;

export const cardSurface = css`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radii.xxl}px;
`;

export const mutedSurface = css`
  background: ${colors.surfaceSoft};
  border: 1px solid ${colors.border};
  border-radius: ${radii.xl}px;
`;

export const interactiveSurface = css`
  transition:
    transform ${transitions.base},
    background ${transitions.base},
    border-color ${transitions.base};

  &:hover {
    transform: translateY(-2px);
    background: rgba(58, 122, 255, 0.06);
    border-color: rgba(58, 122, 255, 0.3);
  }
`;

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const inputBase = css`
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${radii.md}px;
  border: 1px solid ${colors.borderStrong};
  background: ${colors.inputBackground};
  color: ${colors.text};
  font-size: ${typography.sizes.md}px;
  outline: none;
  transition: border-color ${transitions.base};

  &::placeholder {
    color: ${colors.textFaint};
  }

  &:focus {
    border-color: ${colors.primaryBorder};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const scrollbar = css`
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${radii.pill}px;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
    }
  }
`;

export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const panelShadow = css`
  box-shadow: ${shadows.card};
`;
