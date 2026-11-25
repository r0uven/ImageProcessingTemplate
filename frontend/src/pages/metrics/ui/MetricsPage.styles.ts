import styled from "styled-components";

import { SegmentedGroup } from "@/shared/ui/segmented";
import { Card } from "@/shared/ui/card";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";

export const SectionTabs = styled(SegmentedGroup)`
  margin-bottom: 28px;
`;

export const ImageInfoCard = styled(Card)`
  width: 320px;
  padding: 22px;
  border-radius: ${radii.xl + 2}px;
  backdrop-filter: blur(12px);
`;

export const ImageInfoTitle = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
  margin-bottom: ${spacing.sm + 2}px;
`;

export const ImageInfoValue = styled.div`
  font-size: ${typography.sizes.h3}px;
  font-weight: ${typography.weights.bold};
  margin-bottom: 14px;
  overflow-wrap: anywhere;
`;

export const ImageInfoText = styled.div`
  font-size: ${typography.sizes.md}px;
  color: ${colors.textMuted};

  strong {
    color: ${colors.primary};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${spacing.md}px;
  flex-wrap: wrap;
`;
