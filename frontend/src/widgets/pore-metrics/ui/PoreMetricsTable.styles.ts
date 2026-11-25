import styled from "styled-components";

export const TableTitle = styled.h3`
  margin: 0 0 6px;

  font-size: 18px;

  font-weight: 600;
`;

export const TableHeader = styled.div`
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;

  margin-bottom: 14px;
`;

export const TableHeaderText = styled.div`
  flex: 1 1 280px;

  min-width: 0;
`;

export const TableHint = styled.div`
  margin-bottom: 0;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;

export const TableShell = styled.div`
  overflow: hidden;

  border-radius: 16px;

  border: 1px solid rgba(255, 255, 255, 0.07);

  background: rgba(0, 0, 0, 0.18);
`;

export const TableWrapper = styled.div`
  max-height: 460px;

  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;

  border-collapse: collapse;

  font-size: 13px;

  white-space: nowrap;
`;

export const Th = styled.th`
  position: sticky;

  top: 0;

  z-index: 1;

  padding: 0;

  text-align: right;

  font-size: 12px;

  font-weight: 600;

  color: rgba(255, 255, 255, 0.6);

  background: #151b24;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

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

  padding: 12px 16px;

  border: none;

  background: transparent;

  color: ${({ $active }) =>
    $active ? "rgba(255, 255, 255, 0.9)" : "inherit"};

  font: inherit;

  text-align: inherit;

  cursor: pointer;

  transition: color 0.2s ease;

  &:hover {
    color: white;
  }

  &:focus-visible {
    outline: 2px solid rgba(58, 122, 254, 0.8);

    outline-offset: -2px;
  }

  th:first-child & {
    justify-content: flex-start;
  }
`;

export const SortArrow = styled.span<{ $active: boolean }>`
  font-size: 10px;

  line-height: 1;

  color: ${({ $active }) =>
    $active ? "#8fb5ff" : "rgba(255, 255, 255, 0.25)"};
`;

export const Td = styled.td`
  padding: 11px 16px;

  text-align: right;

  color: rgba(255, 255, 255, 0.82);

  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:first-child {
    text-align: left;

    color: rgba(255, 255, 255, 0.55);
  }

  tbody tr:last-child & {
    border-bottom: none;
  }
`;

export const TableFooter = styled.div`
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  flex-wrap: wrap;

  padding: 11px 16px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);

  background: rgba(255, 255, 255, 0.02);

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;

export const EmptyNote = styled.div`
  padding: 18px;

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06);

  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);
`;
