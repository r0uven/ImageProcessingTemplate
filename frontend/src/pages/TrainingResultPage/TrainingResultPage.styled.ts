import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(58, 123, 213, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0, 210, 255, 0.12),
      transparent 30%
    ),
    #0b0f14;

  color: white;

  overflow-y: auto;
`;

export const Content = styled.div`
  max-width: 1600px;

  margin: 0 auto;

  padding: 72px;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  margin-bottom: 40px;
`;

export const HeaderLeft = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 42px;

  font-weight: 700;

  letter-spacing: -1px;
`;

export const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.6);

  font-size: 16px;
`;

export const Status = styled.div`
  padding: 12px 20px;

  border-radius: 14px;

  background: rgba(69, 212, 131, 0.15);

  border: 1px solid rgba(69, 212, 131, 0.3);

  color: #45d483;

  font-weight: 600;
`;

export const MetricsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 20px;

  margin-bottom: 28px;
`;

export const MetricCard = styled.div`
  padding: 22px;

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(18px);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const MetricTitle = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.55);

  margin-bottom: 14px;
`;

export const MetricValue = styled.div`
  font-size: 34px;

  font-weight: 700;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(18px);

  border-radius: 24px;

  padding: 28px;

  margin-bottom: 28px;
`;

export const ChartPlaceholder = styled.div`
  height: 320px;

  border-radius: 18px;

  border: 2px dashed rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.02);

  display: flex;

  align-items: center;

  justify-content: center;

  color: rgba(255, 255, 255, 0.4);

  font-size: 18px;
`;

export const EmptyPreview = styled.div`
  color: rgba(255, 255, 255, 0.35);

  font-size: 15px;
`;

export const StatsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 18px;
`;

export const StatCard = styled.div`
  padding: 18px;

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.05);

  display: flex;

  justify-content: space-between;

  align-items: center;
`;

export const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.55);
`;

export const StatValue = styled.div`
  font-weight: 600;

  font-size: 18px;
`;

export const Footer = styled.div`
  display: flex;

  justify-content: flex-end;

  gap: 16px;

  margin-top: 42px;
`;

export const CancelButton = styled.button`
  height: 52px;

  padding: 0 28px;

  border: none;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.06);

  color: white;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: rgba(220, 70, 70, 0.9);
  }
`;

export const SaveButton = styled.button`
  height: 52px;

  padding: 0 36px;

  border: none;

  border-radius: 14px;

  background: #3a7afe;

  color: white;

  font-weight: 600;

  font-size: 15px;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);

    background: #4b88ff;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SuccessBanner = styled.div`
  margin-bottom: 28px;

  padding: 18px 24px;

  border-radius: 18px;

  background: rgba(69, 212, 131, 0.12);

  border: 1px solid rgba(69, 212, 131, 0.25);

  color: #45d483;

  font-size: 15px;

  font-weight: 500;
`;
export const CardTitle = styled.h2`
  margin: 0;

  margin-bottom: 24px;

  font-size: 22px;

  font-weight: 600;
`;
