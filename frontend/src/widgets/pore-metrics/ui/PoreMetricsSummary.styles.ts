import styled from "styled-components";

export const Card = styled.section`
  padding: 28px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 36px;
`;

export const TopRow = styled.div`
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;

  margin-bottom: 22px;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 8px;

  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;

  font-size: 22px;

  font-weight: 600;
`;

export const Subtitle = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);
`;

export const ExportButton = styled.button`
  height: 46px;

  padding: 0 20px;

  border: none;

  border-radius: 14px;

  background: #3a7afe;

  color: white;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: #4b88ff;

    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.55;

    cursor: default;
  }
`;

export const ExportError = styled.div`
  margin: -10px 0 18px;

  font-size: 12.5px;

  color: #ff8a8a;
`;

export const SummaryGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  gap: 18px;

  margin-bottom: 30px;
`;

export const SummaryItem = styled.div`
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

export const SummaryLabel = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);

  margin-bottom: 10px;
`;

export const SummaryValue = styled.div`
  display: flex;

  align-items: baseline;

  gap: 6px;

  font-size: 26px;

  font-weight: 700;

  color: #3a7afe;

  overflow-wrap: anywhere;
`;

export const Unit = styled.span`
  font-size: 12.5px;

  font-weight: 500;

  color: rgba(255, 255, 255, 0.45);
`;
