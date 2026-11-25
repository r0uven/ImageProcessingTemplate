import styled from "styled-components";

import { Select as SharedSelect } from "@/shared/ui/field";
import { colors, radii, spacing, typography } from "@/shared/styles/tokens";

export const Control = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: 7px ${spacing.md}px;
  border-radius: ${radii.md}px;
  border: 1px solid ${colors.borderFaint};
  background: ${colors.surfaceSoft};
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textMuted};
  white-space: nowrap;
`;

export const Select = styled(SharedSelect)`
  width: auto;
  height: 30px;
  padding: 0 ${spacing.sm}px;
  border-radius: ${radii.sm - 2}px;
  font-size: ${typography.sizes.sm + 0.5}px;
  font-weight: ${typography.weights.semibold};
`;
