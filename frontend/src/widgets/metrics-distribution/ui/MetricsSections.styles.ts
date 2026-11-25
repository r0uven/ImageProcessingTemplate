import styled from "styled-components";

export const ChartCard = styled.div`
  padding: 28px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 36px;
`;

export const ChartHeader = styled.div`
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;

  margin-bottom: 22px;
`;

export const ChartHeaderText = styled.div`
  flex: 1 1 280px;

  min-width: 0;
`;

export const CardHeader = styled.div<{ $compact?: boolean }>`
  margin-bottom: ${({ $compact }) => ($compact ? "0" : "22px")};
`;

export const CardTitle = styled.h2`
  margin: 0;

  font-size: 22px;

  font-weight: 600;
`;

export const CardSubtitle = styled.div`
  margin-top: 8px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);
`;

export const ModeButtons = styled.div`
  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 24px;
`;

export const ModeButton = styled.button<{ $active: boolean }>`
  height: 44px;

  padding: 0 18px;

  border: none;

  border-radius: 14px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition: 0.2s;

  color: ${({ $active }) => ($active ? "white" : "rgba(255,255,255,0.55)")};

  background: ${({ $active }) =>
    $active ? "#3a7afe" : "rgba(255,255,255,0.05)"};

  &:hover {
    color: white;

    background: ${({ $active }) =>
      $active ? "#4b88ff" : "rgba(255,255,255,0.08)"};
  }
`;

export const StatisticsCard = styled.div`
  padding: 28px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 36px;
`;

export const StatisticsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  gap: 18px;
`;

export const Statistic = styled.div`
  padding: 20px;

  border-radius: 18px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.05);

  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);

    background: rgba(58, 122, 255, 0.06);

    border-color: rgba(58, 122, 255, 0.3);
  }
`;

export const Label = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);

  margin-bottom: 10px;
`;

export const Value = styled.div`
  display: flex;

  align-items: baseline;

  gap: 6px;

  font-size: 26px;

  font-weight: 700;

  color: #3a7afe;

  overflow-wrap: anywhere;
`;

export const ValueUnit = styled.span`
  font-size: 12.5px;

  font-weight: 500;

  color: rgba(255, 255, 255, 0.45);
`;
