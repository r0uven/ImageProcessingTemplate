import styled from "styled-components";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import { colors, spacing, typography } from "@/shared/styles/tokens";
import { hintText, mutedSurface } from "@/shared/styles/mixins";

export {
  Checkbox,
  CheckboxRow,
  Field as FieldRow,
  FieldHint as PathHint,
  FieldLabel as Label,
  Input,
  Select,
  Textarea as TextArea,
} from "@/shared/ui/field";

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${spacing.lg}px 22px;
  min-width: 0;
`;

export const GroupBox = styled.div`
  grid-column: 1 / -1;
  min-width: 0;
  ${mutedSurface};
  border-left: 3px solid ${colors.primaryBorder};
  padding: ${spacing.lg}px ${spacing.lg + 2}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md + 2}px;
`;

export const GroupTitle = styled.div`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.textSecondary};
`;

export const ArrayField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm}px;
  grid-column: 1 / -1;
`;

export const ArrayRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
`;

export const ArrayInput = styled(Input)`
  flex: 1;
`;

export const AddButton = styled(Button)`
  align-self: flex-start;
  border-style: dashed;
`;

export const EmptyText = styled.div`
  ${hintText};
`;

export const JsonError = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.dangerText};
`;
