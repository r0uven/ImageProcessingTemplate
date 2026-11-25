import styled, { css } from "styled-components";

import {
  colors,
  radii,
  typography,
} from "@/shared/styles/tokens";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

const variantStyles = {
  neutral: css`
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: ${colors.surface};
    color: ${colors.textMuted};
  `,
  primary: css`
    border: 1px solid ${colors.primaryBorder};
    background: ${colors.primarySoft};
    color: ${colors.primaryText};
  `,
  success: css`
    border: 1px solid ${colors.successBorder};
    background: ${colors.successSoft};
    color: ${colors.successText};
  `,
  warning: css`
    border: 1px solid ${colors.warningBorder};
    background: ${colors.warningSoft};
    color: ${colors.warningText};
  `,
  danger: css`
    border: 1px solid ${colors.dangerBorder};
    background: ${colors.dangerSoft};
    color: ${colors.dangerText};
  `,
};

export const Badge = styled.span<{ $variant?: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: ${radii.pill}px;
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  white-space: nowrap;

  ${({ $variant = "neutral" }) => variantStyles[$variant]};
`;
