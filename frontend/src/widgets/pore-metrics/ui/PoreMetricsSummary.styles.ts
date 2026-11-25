import styled from "styled-components";

import { Button } from "@/shared/ui/button";
import { Card as SharedCard } from "@/shared/ui/card";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";
import { interactiveSurface } from "@/shared/styles/mixins";

export const Card = styled(SharedCard)`
  padding: 28px;
  margin-bottom: 36px;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
  margin-bottom: 22px;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm}px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${typography.sizes.h2}px;
  font-weight: ${typography.weights.semibold};
`;

export const Subtitle = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
`;

export const ExportButton = styled(Button).attrs({
  $variant: "primary",
  $size: "md",
})``;

export const ExportError = styled.div`
  margin: -10px 0 ${spacing.lg + 2}px;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.dangerText};
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${spacing.lg + 2}px;
  margin-bottom: 30px;
`;

export const SummaryItem = styled(SharedCard)`
  padding: ${spacing.xl}px;
  border-radius: ${radii.xl}px;
  ${interactiveSurface};
`;

export const SummaryLabel = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.sm + 2}px;
`;

export const SummaryValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: ${typography.sizes.h1 - 14}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
  overflow-wrap: anywhere;
`;

export const Unit = styled.span`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.textDim};
`;
