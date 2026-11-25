import styled from "styled-components";

import { Button } from "@/shared/ui/button";
import { Card as SharedCard } from "@/shared/ui/card";
import { colors, radii, spacing, transitions, typography } from "@/shared/styles/tokens";

export const Card = styled(SharedCard)`
  padding: 20px 24px;
  margin-bottom: 24px;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
`;

export const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm + 2}px;
  flex-wrap: wrap;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: -0.2px;
`;

export const Badge = styled.span`
  padding: 3px 9px;
  border-radius: ${radii.pill}px;
  background: ${colors.primarySoft};
  border: 1px solid ${colors.primaryBorder};
  color: ${colors.primaryText};
  font-size: ${typography.sizes.xs}px;
  white-space: nowrap;
`;

export const ToggleButton = styled(Button).attrs({
  $variant: "secondary",
  $size: "sm",
})`
  display: inline-flex;
  gap: 8px;
`;

export const Chevron = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  line-height: 1;
  transition: transform ${transitions.base};
  transform: rotate(${({ $expanded }) => ($expanded ? 180 : 0)}deg);
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 14px;
`;

export const SummaryRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${spacing.lg}px;
  padding: 3px 0;
  min-width: 0;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1px;
  }
`;

export const SummaryLabel = styled.span`
  flex: 0 0 150px;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const SummaryValue = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textSecondary};
  overflow-wrap: anywhere;
`;

export const Groups = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 22px 36px;
  margin-top: ${spacing.lg + 2}px;
  padding-top: ${spacing.lg + 2}px;
  border-top: 1px solid ${colors.border};
`;

export const Group = styled.div`
  min-width: 0;
`;

export const GroupTitle = styled.div`
  margin-bottom: ${spacing.sm}px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.bold};
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${colors.textDim};
`;

export const GroupRows = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  column-gap: 28px;
`;

export const Row = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: ${({ $stacked }) => ($stacked ? "column" : "row")};
  align-items: ${({ $stacked }) => ($stacked ? "stretch" : "baseline")};
  justify-content: space-between;
  gap: ${({ $stacked }) => ($stacked ? "2px" : spacing.md + "px")};
  padding: 3px 0;
  font-size: ${typography.sizes.sm}px;
  line-height: 1.4;
`;

export const RowLabel = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  color: ${colors.textMuted};
  overflow-wrap: anywhere;
`;

export const RowValue = styled.span<{ $stacked?: boolean }>`
  flex: 0 0 auto;
  max-width: ${({ $stacked }) => ($stacked ? "100%" : "55%")};
  color: ${colors.textSecondary};
  text-align: ${({ $stacked }) => ($stacked ? "left" : "right")};
  overflow-wrap: anywhere;
`;

export const Note = styled.div`
  margin-top: ${spacing.md}px;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;
