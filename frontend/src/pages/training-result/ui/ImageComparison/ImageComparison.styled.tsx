import styled from "styled-components";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { CardTitle as SharedCardTitle } from "@/shared/ui/typography";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";
import { hintText } from "@/shared/styles/mixins";

export const CardTitle = styled(SharedCardTitle)``;

export const PreviewContainer = styled.div`
  margin-top: ${spacing.lg}px;
`;

export const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.xxl}px;
`;

export const ImageCard = styled(Card)`
  padding: ${spacing.lg}px;
  border-radius: ${radii.xl}px;
`;

export const ImageTitle = styled.div`
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.sm + 2}px;
`;

export const ImageWrapper = styled.div`
  border-radius: ${radii.md}px;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`;

export const Viewer = styled.div`
  position: relative;
  border-radius: ${radii.md}px;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
`;

export const BaseImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
`;

export const OverlayImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Divider = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${colors.text};
  transform: translateX(-50%);
`;

export const Handle = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.primary};
  color: ${colors.text};
  font-size: ${typography.sizes.lg}px;
`;

export const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${spacing.sm + 2}px;
  ${hintText};
`;

export const PerImageMetrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md}px;
  margin-top: ${spacing.lg}px;
`;

export const PerImageMetric = styled.div`
  padding: 6px ${spacing.md}px;
  border-radius: ${radii.sm}px;
  background: ${colors.primarySoft};
  border: 1px solid ${colors.primaryBorder};
  color: ${colors.primaryText};
  font-size: ${typography.sizes.sm}px;
`;

export const Navigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md}px;
  margin-top: ${spacing.lg}px;
`;

export const NavButton = styled(Button).attrs({
  $variant: "secondary",
  $size: "sm",
})``;

export const ImageCounter = styled.div`
  ${hintText};
`;
