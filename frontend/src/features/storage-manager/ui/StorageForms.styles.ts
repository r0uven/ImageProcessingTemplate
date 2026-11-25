import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/field";
import { colors, spacing, typography } from "@/shared/styles/tokens";
import { hintText } from "@/shared/styles/mixins";

export {
  Checkbox,
  CheckboxRow,
} from "@/shared/ui/field";

export const StorageForm = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
  padding: ${spacing.lg + 2}px ${spacing.xl}px;
  border-radius: 16px;
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.16);
`;

export const FormTitle = styled.div`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.textSecondary};
`;

export const FormRow = styled.div`
  display: flex;
  gap: ${spacing.sm + 2}px;
  flex-wrap: wrap;
  align-items: center;
`;

export const FormInput = styled(Input)`
  flex: 1;
  min-width: 220px;
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${spacing.sm + 2}px;
  flex-wrap: wrap;
  align-items: center;
`;

export const FormHint = styled.div`
  ${hintText};
  color: rgba(255, 120, 120, 0.85);
`;

export const StorageInlineForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm + 2}px;
  padding: 14px ${spacing.lg}px;
  border-radius: 14px;
  border: 1px solid ${colors.borderFaint};
  background: ${colors.inputBackgroundSoft};
`;

export const DialogChecks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm + 2}px;
  margin: 0 0 22px;
`;

export const DialogHint = styled.div`
  ${hintText};
  margin: -${spacing.sm}px 0 ${spacing.xl}px;
`;
