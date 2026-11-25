import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { colors, spacing, typography } from "@/shared/styles/tokens";

export const StorageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md + 2}px;
`;

export const StorageCard = styled(Card)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md + 2}px;
  padding: ${spacing.lg + 2}px ${spacing.xl}px;
  border-radius: 16px;
  border-color: ${({ $active }) =>
    $active ? colors.primaryBorder : colors.border};
  background: ${({ $active }) =>
    $active ? colors.primarySoft : "rgba(0, 0, 0, 0.18)"};
`;

export const StorageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
`;

export const StorageTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const StorageNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm + 2}px;
  flex-wrap: wrap;
`;

export const StorageName = styled.span`
  font-size: ${typography.sizes.md + 1}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text};
`;

export const StorageId = styled.span`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textFaint};
`;

export const StoragePath = styled.code`
  font-size: ${typography.sizes.sm}px;
  line-height: ${typography.lineHeights.relaxed};
  color: ${colors.textMuted};
  overflow-wrap: anywhere;
`;

export const StorageBadges = styled.div`
  display: flex;
  gap: ${spacing.sm}px;
  flex-wrap: wrap;
`;

export const StorageStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm}px ${spacing.xl}px;
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textMuted};
`;

export const StorageActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
`;
