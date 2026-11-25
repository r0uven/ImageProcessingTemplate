import styled from "styled-components";

import { colors, radii, spacing, typography } from "@/shared/styles/tokens";
import { hintText } from "@/shared/styles/mixins";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: ${spacing.xxl}px;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxl}px;
  min-width: 0;
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxl}px;
`;

export const ProgressBar = styled.div`
  height: 10px;
  border-radius: ${radii.pill}px;
  background: ${colors.surfaceStrong};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${colors.primary};
  transition: width 0.3s ease;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${spacing.sm + 2}px;
  color: ${colors.textMuted};
`;

export const Metrics = styled.div`
  display: flex;
  gap: ${spacing.xl}px;
`;

export const Metric = styled.div`
  flex: 1;
  padding: 14px;
  border-radius: ${radii.lg}px;
  background: ${colors.surfaceSoft};
`;

export const Label = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
`;

export const Value = styled.div`
  font-size: ${typography.sizes.h3}px;
  font-weight: ${typography.weights.semibold};
  margin-top: 6px;
`;

export const Logs = styled.div`
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm}px;
`;

export const Log = styled.div`
  font-family: ${typography.monospace};
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textSecondary};
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.sm + 2}px;
  color: ${colors.textSecondary};
`;

export const PreviewBox = styled.div`
  height: 220px;
  border-radius: ${radii.xl}px;
  background: ${colors.surfaceSoft};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const PreviewText = styled.div`
  ${hintText};
`;
