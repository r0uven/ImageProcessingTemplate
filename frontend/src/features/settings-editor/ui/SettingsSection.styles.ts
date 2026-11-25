import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { focusRing } from "@/shared/styles/mixins";
import { colors, radii, spacing, transitions, typography } from "@/shared/styles/tokens";

export const SectionCard = styled(Card)<{ $open: boolean }>`
  padding: ${({ $open }) =>
    $open ? `22px ${spacing.xxl}px ${spacing.xxl}px` : `${spacing.lg}px ${spacing.xxl}px`};
  margin-bottom: ${spacing.lg - 2}px;
  transition:
    padding ${transitions.base},
    border-color ${transitions.base};

  &:hover {
    border-color: ${colors.borderStrong};
  }
`;

export const SectionHeaderButton = styled.button`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  ${focusRing};
`;

export const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm + 2}px;
  min-width: 0;
`;

export const SectionChevron = styled.span<{ $open: boolean }>`
  flex: 0 0 auto;
  font-size: ${typography.sizes.md + 1}px;
  line-height: 1;
  color: ${colors.textDim};
  transition: transform ${transitions.base};
  transform: rotate(${({ $open }) => ($open ? 90 : 0)}deg);
`;

export const SectionTitle = styled.div`
  min-width: 0;
  font-size: ${typography.sizes.h3}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: -0.3px;
`;

export const SectionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm + 2}px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const SectionCount = styled.span`
  padding: 4px ${spacing.sm}px;
  border-radius: ${radii.pill}px;
  background: ${colors.surfaceStrong};
  font-size: ${typography.sizes.xs}px;
  color: ${colors.textMuted};
  white-space: nowrap;
`;

export const SectionKey = styled.code`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textFaint};
  font-family: ${typography.monospace};
  white-space: nowrap;
`;

export const SectionBody = styled.div`
  margin-top: ${spacing.xl}px;
  padding-top: ${spacing.lg + 2}px;
  border-top: 1px solid ${colors.border};
`;

export const StorageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl}px;
  margin-bottom: ${spacing.xxl}px;
`;
