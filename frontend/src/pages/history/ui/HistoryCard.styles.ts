import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import {
  colors,
  radii,
  spacing,
  typography,
} from "@/shared/styles/tokens";

export const HistoryCardRoot = styled(Card)`
  display: flex;
  gap: ${spacing.xxl}px;
  padding: ${spacing.xxl}px;
`;

export const ImagePreview = styled.div`
  width: 240px;
  height: 240px;
  flex-shrink: 0;
  border-radius: ${radii.xl}px;
  overflow: hidden;
  background: ${colors.surfaceSoft};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NoPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.sizes.md}px;
  color: ${colors.textFaint};
`;

export const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.xxl}px;
`;

export const FileName = styled.div`
  font-size: ${typography.sizes.h2}px;
  font-weight: ${typography.weights.semibold};
  overflow-wrap: anywhere;
`;

export const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
  flex-shrink: 0;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing.xxl}px;
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm}px;
  min-width: 0;
`;

export const Label = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const Value = styled.div`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.medium};
  overflow-wrap: anywhere;
`;

export const FailureReason = styled.div`
  margin: 0 0 ${spacing.lg}px;
  padding: ${spacing.sm + 2}px ${spacing.md}px;
  border-radius: ${radii.md}px;
  border: 1px solid ${colors.dangerBorder};
  background: ${colors.dangerSoft};
  color: ${colors.dangerText};
  font-size: ${typography.sizes.sm}px;
  line-height: ${typography.lineHeights.normal};
  overflow-wrap: anywhere;
`;

export const Actions = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  padding-top: ${spacing.xxl}px;
`;
