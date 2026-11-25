import styled from "styled-components";

import { Card as SharedCard } from "@/shared/ui/card";
import {
  colors,
  radii,
  spacing,
  typography,
} from "@/shared/styles/tokens";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${radii.lg}px;
  margin-bottom: 22px;
  padding: ${spacing.lg}px;
  border-radius: ${radii.xl}px;
  background: ${colors.surfaceSoft};
  border: 1px solid ${colors.border};
  backdrop-filter: blur(12px);
`;

export const SectionTitle = styled.h3`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: 0.3px;
  color: ${colors.textSecondary};
  margin: 0;
`;

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
`;

export const Card = styled(SharedCard)`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
  padding: 14px ${spacing.lg}px;
  border-radius: ${radii.lg}px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const FieldLabel = styled.label`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
`;
