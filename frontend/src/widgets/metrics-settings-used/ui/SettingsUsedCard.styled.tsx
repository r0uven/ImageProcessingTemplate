import styled from "styled-components";

export const Card = styled.section`
  padding: 20px 24px;

  border-radius: 22px;

  background: rgba(255, 255, 255, 0.035);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 24px;
`;

export const TopRow = styled.div`
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;
`;

export const TitleWrap = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  flex-wrap: wrap;

  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;

  font-size: 16px;

  font-weight: 650;

  letter-spacing: -0.2px;
`;

export const Badge = styled.span`
  padding: 3px 9px;

  border-radius: 999px;

  background: rgba(58, 122, 254, 0.14);

  border: 1px solid rgba(58, 122, 254, 0.25);

  color: #9cc0ff;

  font-size: 11px;

  white-space: nowrap;
`;

export const ToggleButton = styled.button<{ $expanded: boolean }>`
  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding: 8px 12px;

  border-radius: 10px;

  border: 1px solid rgba(255, 255, 255, 0.1);

  background: ${({ $expanded }) =>
    $expanded ? "rgba(58, 122, 254, 0.16)" : "rgba(255, 255, 255, 0.04)"};

  color: rgba(255, 255, 255, 0.78);

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

  &:hover {
    border-color: rgba(58, 122, 254, 0.45);

    color: white;

    background: rgba(58, 122, 254, 0.2);
  }

  &:focus-visible {
    outline: 2px solid rgba(58, 122, 254, 0.8);

    outline-offset: 2px;
  }
`;

export const Chevron = styled.span<{ $expanded: boolean }>`
  font-size: 10px;

  line-height: 1;

  transition: transform 0.2s ease;

  transform: rotate(${({ $expanded }) => ($expanded ? 180 : 0)}deg);
`;

export const Summary = styled.div`
  display: flex;

  flex-direction: column;

  margin-top: 14px;
`;

export const SummaryRow = styled.div`
  display: flex;

  align-items: baseline;

  gap: 16px;

  padding: 3px 0;

  min-width: 0;

  @media (max-width: 640px) {
    flex-direction: column;

    gap: 1px;
  }
`;

export const SummaryLabel = styled.span`
  flex: 0 0 150px;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.42);
`;

export const SummaryValue = styled.span`
  flex: 1 1 auto;

  min-width: 0;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.88);

  overflow-wrap: anywhere;
`;

export const Groups = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));

  gap: 22px 36px;

  margin-top: 18px;

  padding-top: 18px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const Group = styled.div`
  min-width: 0;
`;

export const GroupTitle = styled.div`
  margin-bottom: 8px;

  padding-bottom: 6px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  font-size: 10.5px;

  font-weight: 700;

  letter-spacing: 0.6px;

  text-transform: uppercase;

  color: rgba(255, 255, 255, 0.4);
`;

export const GroupRows = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));

  column-gap: 28px;
`;

export const Row = styled.div<{ $stacked?: boolean }>`
  display: flex;

  flex-direction: ${({ $stacked }) => ($stacked ? "column" : "row")};

  align-items: ${({ $stacked }) => ($stacked ? "stretch" : "baseline")};

  justify-content: space-between;

  gap: ${({ $stacked }) => ($stacked ? "2px" : "12px")};

  padding: 3px 0;

  font-size: 12.5px;

  line-height: 1.4;
`;

export const RowLabel = styled.span`
  flex: 1 1 auto;

  min-width: 0;

  color: rgba(255, 255, 255, 0.55);

  overflow-wrap: anywhere;
`;

export const RowValue = styled.span<{ $stacked?: boolean }>`
  flex: 0 0 auto;

  max-width: ${({ $stacked }) => ($stacked ? "100%" : "55%")};

  color: rgba(255, 255, 255, 0.9);

  text-align: ${({ $stacked }) => ($stacked ? "left" : "right")};

  overflow-wrap: anywhere;
`;

export const Note = styled.div`
  margin-top: 12px;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;
