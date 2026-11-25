import styled, { css } from "styled-components";

import {
  colors,
  radii,
  spacing,
  typography,
} from "@/shared/styles/tokens";

export type MessageVariant = "success" | "error" | "info";

const variantStyles = {
  success: css`
    border-color: ${colors.successBorder};
    background: ${colors.successSoft};
    color: ${colors.successText};
  `,
  error: css`
    border-color: ${colors.dangerBorder};
    background: ${colors.dangerSoft};
    color: ${colors.dangerText};
  `,
  info: css`
    border-color: ${colors.primaryBorder};
    background: ${colors.primarySoft};
    color: ${colors.primaryText};
  `,
};

export const Message = styled.div<{ $variant?: MessageVariant }>`
  padding: ${spacing.md}px ${spacing.lg}px;
  border: 1px solid transparent;
  border-radius: ${radii.lg}px;
  font-size: ${typography.sizes.md}px;
  line-height: ${typography.lineHeights.normal};
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  ${({ $variant = "success" }) => variantStyles[$variant]};
`;
