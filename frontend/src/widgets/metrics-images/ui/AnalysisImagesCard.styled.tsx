import styled from "styled-components";

import { Card as SharedCard } from "@/shared/ui/card";
import { colors, radii, spacing, transitions, typography } from "@/shared/styles/tokens";

export const Card = styled(SharedCard)`
  padding: 20px 24px;
  margin-bottom: 24px;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs}px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: -0.2px;
`;

export const Subtitle = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const OpenLink = styled.a`
  padding: 7px 11px;
  border-radius: ${radii.sm}px;
  border: 1px solid ${colors.primaryBorder};
  background: ${colors.primarySoft};
  color: ${colors.primaryText};
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  text-decoration: none;
  transition: ${transitions.base};

  &:hover {
    background: rgba(58, 122, 254, 0.2);
    border-color: ${colors.primaryBorder};
    color: ${colors.text};
  }
`;

export const OpenLinkDisabled = styled.span`
  padding: 7px 11px;
  border-radius: ${radii.sm}px;
  border: 1px solid ${colors.borderFaint};
  background: ${colors.surfaceSoft};
  color: ${colors.textDim};
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  cursor: not-allowed;
  user-select: none;
`;

export const Viewer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  margin-top: ${spacing.lg}px;
  padding: ${spacing.md}px;
  border-radius: ${radii.xl}px;
  border: 1px solid ${colors.border};
  background: rgba(0, 0, 0, 0.25);
`;

export const ViewerLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const Preview = styled.img`
  display: block;
  max-width: 100%;
  max-height: 520px;
  object-fit: contain;
  border-radius: ${radii.sm}px;
`;

export const Thumbnails = styled.div`
  display: flex;
  gap: ${spacing.sm + 2}px;
  margin-top: 14px;
  flex-wrap: wrap;
`;

export const ThumbButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 124px;
  padding: 7px;
  border-radius: ${radii.md}px;
  border: 1px solid
    ${({ $active }) => ($active ? colors.primaryBorder : colors.borderFaint)};
  background: ${({ $active }) =>
    $active ? colors.primarySoft : colors.surfaceSoft};
  color: ${({ $active }) => ($active ? colors.text : colors.textMuted)};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  cursor: pointer;
  transition: ${transitions.base};

  &:hover {
    border-color: ${colors.primaryBorder};
    background: ${colors.primarySoft};
    color: ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

export const ThumbImage = styled.img`
  display: block;
  width: 100%;
  height: 64px;
  object-fit: contain;
  border-radius: ${radii.sm - 2}px;
  background: rgba(0, 0, 0, 0.3);
`;

export const ThumbLabel = styled.span`
  text-align: center;
  overflow-wrap: anywhere;
`;

export const Note = styled.div`
  margin-top: ${spacing.md}px;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;
