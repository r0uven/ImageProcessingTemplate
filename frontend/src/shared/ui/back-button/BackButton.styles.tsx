import styled from "styled-components";

import { Button } from "@/shared/ui/button";
import { shadows, spacing, typography, zIndex } from "@/shared/styles/tokens";

export const BackButtonContainer = styled(Button).attrs({
  $variant: "secondary",
  $size: "md",
})`
  position: fixed;
  top: ${spacing.xxl}px;
  left: ${spacing.xxl}px;
  z-index: ${zIndex.backButton};
  gap: ${spacing.sm + 2}px;
  padding: 0 18px;
  border-radius: 16px;
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: ${shadows.floating};
`;

export const BackIcon = styled.span`
  font-size: ${typography.sizes.xl}px;
  line-height: 1;
`;

export const BackText = styled.span`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  letter-spacing: 0.3px;
`;
