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
`;

export const Content = styled.div`
  max-width: 1400px;

  margin: 0 auto;

  padding: 72px;
  box-sizing: border-box;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 24px;

  margin-bottom: 40px;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 40px;

  font-weight: 700;

  letter-spacing: -1px;
`;

export const Subtitle = styled.div`
  font-size: 17px;

  color: rgba(255, 255, 255, 0.6);
`;

export const ImageInfoCard = styled.div`
  width: 320px;

  padding: 22px;

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(12px);
`;

export const ImageInfoTitle = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.45);

  margin-bottom: 10px;
`;

export const ImageInfoValue = styled.div`
  font-size: 20px;

  font-weight: 700;

  margin-bottom: 14px;
`;

export const ImageInfoText = styled.div`
  font-size: 14px;

  color: rgba(255, 255, 255, 0.65);

  strong {
    color: #3a7afe;
  }
`;

export const ChartCard = styled.div`
  padding: 28px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 28px;
`;

export const CardTitle = styled.h2`
  margin: 0 0 22px;

  font-size: 22px;

  font-weight: 600;
`;

export const ModeButtons = styled.div`
  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 24px;
`;

export const ModeButton = styled.button<{ active: boolean }>`
  height: 44px;

  padding: 0 18px;

  border: none;

  border-radius: 14px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition: 0.2s;

  color: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.55)")};

  background: ${({ active }) =>
    active ? "#3a7afe" : "rgba(255,255,255,0.05)"};

  &:hover {
    color: white;

    background: ${({ active }) =>
      active ? "#4b88ff" : "rgba(255,255,255,0.08)"};
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
  font-size: 26px;

  font-weight: 700;

  color: #3a7afe;
`;

export const Actions = styled.div`
  display: flex;

  justify-content: flex-end;
`;

export const NewProcessingButton = styled.button`
  height: 54px;

  padding: 0 26px;

  border: none;

  border-radius: 16px;

  background: #3a7afe;

  color: white;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

  &:hover {
    background: #4b88ff;

    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;
