import styled, { css } from "styled-components";

import { focusRing } from "@/shared/styles/mixins";
import {
  colors,
  radii,
  transitions,
  typography,
} from "@/shared/styles/tokens";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dangerSoft"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

const sizeStyles = {
  sm: css`
    height: 34px;
    padding: 0 12px;
    border-radius: ${radii.sm}px;
    font-size: ${typography.sizes.sm}px;
  `,
  md: css`
    height: 46px;
    padding: 0 20px;
    border-radius: ${radii.lg}px;
    font-size: ${typography.sizes.md}px;
  `,
  lg: css`
    height: 54px;
    padding: 0 26px;
    border-radius: ${radii.xl}px;
    font-size: ${typography.sizes.lg}px;
  `,
};

const variantStyles = {
  primary: css`
    border: 1px solid transparent;
    background: ${colors.primary};
    color: ${colors.text};

    &:hover:not(:disabled) {
      background: ${colors.primaryHover};
      transform: translateY(-1px);
    }
  `,
  secondary: css`
    border: 1px solid ${colors.borderStrong};
    background: rgba(255, 255, 255, 0.05);
    color: ${colors.text};

    &:hover:not(:disabled) {
      background: ${colors.surfaceHover};
      border-color: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
    }
  `,
  danger: css`
    border: 1px solid transparent;
    background: ${colors.danger};
    color: ${colors.text};

    &:hover:not(:disabled) {
      background: ${colors.dangerHover};
      transform: translateY(-1px);
    }
  `,
  dangerSoft: css`
    border: 1px solid ${colors.dangerBorder};
    background: ${colors.dangerSoft};
    color: ${colors.dangerText};

    &:hover:not(:disabled) {
      background: rgba(255, 93, 93, 0.2);
    }
  `,
  ghost: css`
    border: 1px solid transparent;
    background: transparent;
    color: ${colors.textMuted};

    &:hover:not(:disabled) {
      background: ${colors.surfaceStrong};
      color: ${colors.text};
    }
  `,
};

export const Button = styled.button<{
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $size = "md" }) => ($size === "sm" ? 6 : 8)}px;
  font-weight: ${typography.weights.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform ${transitions.base},
    background ${transitions.fast},
    border-color ${transitions.fast},
    opacity ${transitions.fast};

  ${({ $size = "md" }) => sizeStyles[$size]};
  ${({ $variant = "primary" }) => variantStyles[$variant]};

  ${({ $fullWidth }) => $fullWidth && "width: 100%;"}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${focusRing};
`;

export const IconButton = styled.button<{
  $variant?: "secondary" | "danger" | "ghost";
  $size?: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: ${({ $size = 42 }) => $size}px;
  height: ${({ $size = 42 }) => $size}px;
  padding: 0;
  border-radius: ${radii.lg}px;
  cursor: pointer;
  transition:
    background ${transitions.fast},
    border-color ${transitions.fast},
    color ${transitions.fast},
    transform ${transitions.base};

  ${({ $variant = "secondary" }) => {
    if ($variant === "danger") {
      return css`
        border: 1px solid ${colors.dangerBorder};
        background: ${colors.dangerSoft};
        color: ${colors.dangerText};

        &:hover:not(:disabled) {
          background: ${colors.danger};
          border-color: transparent;
          color: ${colors.text};
        }
      `;
    }

    if ($variant === "ghost") {
      return css`
        border: 1px solid transparent;
        background: transparent;
        color: ${colors.textMuted};

        &:hover:not(:disabled) {
          background: ${colors.surfaceStrong};
          color: ${colors.text};
        }
      `;
    }

    return css`
      border: 1px solid ${colors.borderFaint};
      background: rgba(255, 255, 255, 0.05);
      color: ${colors.textSecondary};

      &:hover:not(:disabled) {
        background: ${colors.surfaceHover};
        color: ${colors.text};
      }
    `;
  }}

  svg {
    width: ${({ $size = 42 }) => Math.max(16, Math.round($size * 0.45))}px;
    height: ${({ $size = 42 }) => Math.max(16, Math.round($size * 0.45))}px;
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${focusRing};
`;
