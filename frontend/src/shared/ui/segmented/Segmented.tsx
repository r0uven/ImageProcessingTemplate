import styled, { css } from "styled-components";

import { focusRing } from "@/shared/styles/mixins";
import {
  colors,
  radii,
  transitions,
  typography,
} from "@/shared/styles/tokens";

export type SegmentedSize = "sm" | "md" | "lg";

const sizeStyles = {
  sm: css`
    height: 36px;
    padding: 0 14px;
    font-size: ${typography.sizes.sm}px;
    border-radius: ${radii.md}px;
  `,
  md: css`
    height: 42px;
    padding: 0 18px;
    font-size: ${typography.sizes.md}px;
    border-radius: ${radii.md}px;
  `,
  lg: css`
    height: 48px;
    padding: 0 22px;
    font-size: ${typography.sizes.md}px;
    border-radius: ${radii.lg}px;
  `,
};

export const SegmentedGroup = styled.div<{ $plain?: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;

  ${({ $plain }) =>
    !$plain &&
    css`
      padding: 4px;
      border-radius: ${radii.xl}px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
    `}
`;

export const SegmentedButton = styled.button<{
  $active?: boolean;
  $size?: SegmentedSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: ${colors.textMuted};
  font-weight: ${typography.weights.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition:
    color ${transitions.fast},
    background ${transitions.fast},
    border-color ${transitions.fast};

  ${({ $size = "md" }) => sizeStyles[$size]};

  ${({ $active }) =>
    $active
      ? css`
          border-color: ${colors.primaryBorder};
          background: ${colors.primary};
          color: ${colors.text};
        `
      : css`
          &:hover {
            background: ${colors.surfaceStrong};
            color: ${colors.text};
          }
        `}

  ${focusRing};
`;
