import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";

export const Status = styled.div`
  padding: ${spacing.md}px ${spacing.xl}px;
  border-radius: ${radii.lg}px;
  background: ${colors.successSoft};
  border: 1px solid ${colors.successBorder};
  color: ${colors.success};
  font-weight: ${typography.weights.semibold};
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing.xl}px;
  margin-bottom: 28px;
`;

export const MetricCard = styled(Card)`
  padding: 22px;
  border-radius: ${radii.xl}px;
  backdrop-filter: blur(18px);
`;

export const MetricTitle = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
  margin-bottom: 14px;
`;

export const MetricValue = styled.div`
  font-size: 34px;
  font-weight: ${typography.weights.bold};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.xl - 2}px;
`;

export const StatCard = styled(Card)`
  padding: ${spacing.lg + 2}px;
  border-radius: ${radii.xl - 2}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.md}px;
`;

export const StatLabel = styled.div`
  color: ${colors.textMuted};
`;

export const StatValue = styled.div`
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.xl}px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.lg}px;
  margin-top: 42px;
`;

export const SuccessBanner = styled.div`
  margin-bottom: 28px;
  padding: ${spacing.lg + 2}px ${spacing.xxl}px;
  border-radius: ${radii.xl}px;
  background: ${colors.successSoft};
  border: 1px solid ${colors.successBorder};
  color: ${colors.success};
  font-size: ${typography.sizes.md + 1}px;
  font-weight: ${typography.weights.medium};
`;
