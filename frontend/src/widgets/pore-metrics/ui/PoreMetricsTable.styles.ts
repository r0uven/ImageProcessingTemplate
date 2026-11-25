import styled from "styled-components";

import { focusRing } from "@/shared/styles/mixins";
import { colors, spacing, typography } from "@/shared/styles/tokens";

export const TableTitle = styled.h3`
  margin: 0 0 6px;
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.semibold};
`;

export const TableHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.lg}px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`;

export const TableHeaderText = styled.div`
  flex: 1 1 280px;
  min-width: 0;
`;

export const TableHint = styled.div`
  margin-bottom: 0;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const TableShell = styled.div`
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid ${colors.border};
  background: rgba(0, 0, 0, 0.18);
`;

export const TableWrapper = styled.div`
  max-height: 460px;
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${typography.sizes.sm + 0.5}px;
  white-space: nowrap;
`;

export const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0;
  text-align: right;
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.textMuted};
  background: ${colors.backgroundElevated};
  border-bottom: 1px solid ${colors.borderFaint};

  &:first-child {
    text-align: left;
  }
`;

export const SortButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  width: 100%;
  padding: ${spacing.md}px ${spacing.lg}px;
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? colors.textSecondary : "inherit")};
  font: inherit;
  text-align: inherit;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.text};
  }

  ${focusRing};

  th:first-child & {
    justify-content: flex-start;
  }
`;

export const SortArrow = styled.span<{ $active: boolean }>`
  font-size: 10px;
  line-height: 1;
  color: ${({ $active }) => ($active ? colors.primaryText : colors.textFaint)};
`;

export const Td = styled.td`
  padding: 11px ${spacing.lg}px;
  text-align: right;
  color: ${colors.textSecondary};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:first-child {
    text-align: left;
    color: ${colors.textMuted};
  }

  tbody tr:last-child & {
    border-bottom: none;
  }
`;

export const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md}px;
  flex-wrap: wrap;
  padding: 11px ${spacing.lg}px;
  border-top: 1px solid ${colors.border};
  background: ${colors.surfaceFaint};
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const EmptyNote = styled.div`
  padding: ${spacing.lg + 2}px;
  border-radius: 16px;
  background: ${colors.surfaceSoft};
  border: 1px solid ${colors.border};
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textMuted};
`;
