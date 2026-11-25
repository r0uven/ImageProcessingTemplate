import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { SegmentedGroup } from "@/shared/ui/segmented";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";

export { CardTitle, CardSubtitle } from "@/shared/ui/typography";

export const ChartCard = styled(Card)`
  padding: 28px;
  margin-bottom: 36px;
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
  margin-bottom: 22px;
`;

export const ChartHeaderText = styled.div`
  flex: 1 1 280px;
  min-width: 0;
`;

export const CardHeader = styled.div<{ $compact?: boolean }>`
  margin-bottom: ${({ $compact }) => ($compact ? "0" : "22px")};
`;

export const ModeButtons = styled(SegmentedGroup)`
  margin-bottom: ${spacing.xxl}px;
`;

export const StatisticsCard = styled(Card)`
  padding: 28px;
  margin-bottom: 36px;
`;

export const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${spacing.lg + 2}px;
`;

export const Statistic = styled(Card)`
  padding: ${spacing.xl}px;
  border-radius: ${radii.xl}px;
  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: rgba(58, 122, 255, 0.06);
    border-color: rgba(58, 122, 255, 0.3);
  }
`;

export const Label = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.sm + 2}px;
`;

export const Value = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: ${typography.sizes.h1 - 14}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
  overflow-wrap: anywhere;
`;

export const ValueUnit = styled.span`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.textDim};
`;
