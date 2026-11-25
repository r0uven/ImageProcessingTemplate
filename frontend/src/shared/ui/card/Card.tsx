import styled, { css } from "styled-components";

import {
  cardSurface,
  interactiveSurface,
  mutedSurface,
} from "@/shared/styles/mixins";
import { colors, radii, spacing } from "@/shared/styles/tokens";

export type CardPadding = "sm" | "md" | "lg" | "xl";

const paddingStyles = {
  sm: css`
    padding: ${spacing.lg}px ${spacing.xl}px;
  `,
  md: css`
    padding: ${spacing.xl}px ${spacing.xxl}px;
  `,
  lg: css`
    padding: ${spacing.xxl}px;
  `,
  xl: css`
    padding: 28px;
  `,
};

export const Card = styled.section<{
  $padding?: CardPadding;
  $interactive?: boolean;
  $muted?: boolean;
  $accent?: boolean;
}>`
  ${({ $muted }) => ($muted ? mutedSurface : cardSurface)};
  border-radius: ${radii.xxl}px;
  ${({ $padding = "lg" }) => paddingStyles[$padding]};

  ${({ $accent }) =>
    $accent &&
    css`
      border-color: ${colors.primaryBorder};
      background: ${colors.primarySoft};
    `}

  ${({ $interactive }) => $interactive && interactiveSurface};
`;
