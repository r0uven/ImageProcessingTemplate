import styled from "styled-components";

import { colors, spacing, typography } from "@/shared/styles/tokens";

export const Sidebar = styled.div`
  position: sticky;
  top: ${spacing.xxl}px;
  height: fit-content;
`;

export const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg}px;
`;

export const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.md}px;
`;

export const StatLabel = styled.div`
  color: ${colors.textMuted};
  font-size: ${typography.sizes.md}px;
`;

export const StatValue = styled.div`
  font-weight: ${typography.weights.semibold};
`;
