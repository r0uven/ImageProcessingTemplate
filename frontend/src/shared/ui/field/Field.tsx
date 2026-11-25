import styled from "styled-components";

import { inputBase } from "@/shared/styles/mixins";
import {
  colors,
  radii,
  spacing,
  transitions,
  typography,
} from "@/shared/styles/tokens";

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm - 1}px;
  min-width: 0;
`;

export const FieldLabel = styled.span`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.textSecondary};
`;

export const FieldHint = styled.span`
  display: block;
  font-size: ${typography.sizes.xs}px;
  color: ${colors.textFaint};
  font-family: ${typography.monospace};
  overflow-wrap: anywhere;
`;

export const Input = styled.input`
  ${inputBase};
`;

export const Select = styled.select`
  ${inputBase};

  cursor: pointer;

  option {
    background: ${colors.backgroundElevated};
    color: ${colors.text};
  }
`;

export const Textarea = styled.textarea`
  ${inputBase};

  min-height: 110px;
  font-family: ${typography.monospace};
  font-size: ${typography.sizes.sm}px;
  line-height: ${typography.lineHeights.relaxed};
  resize: vertical;
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm + 2}px;
  width: 100%;
  min-width: 0;
  padding: ${spacing.sm + 2}px ${spacing.md}px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${radii.md}px;
  background: ${colors.inputBackgroundSoft};
  color: ${colors.textSecondary};
  font-size: ${typography.sizes.md}px;
  cursor: pointer;
  transition:
    border-color ${transitions.fast},
    background ${transitions.fast};

  &:hover {
    border-color: ${colors.borderStrong};
  }

  & > span {
    flex: 1;
    min-width: 0;
    line-height: ${typography.lineHeights.normal};
    overflow-wrap: anywhere;
  }
`;

export const Checkbox = styled.input`
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: ${colors.primary};
  cursor: pointer;
`;
