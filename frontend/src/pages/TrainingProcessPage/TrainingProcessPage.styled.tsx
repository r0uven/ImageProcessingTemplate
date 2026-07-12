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
  padding: 48px;
  padding-top: 72px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 38px;
`;

export const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.6);
`;

export const StatusBadge = styled.div<{ status: string }>`
  padding: 8px 14px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;

  background: ${({ status }) =>
    status === "TRAINING"
      ? "rgba(58,122,255,0.2)"
      : status === "COMPLETED"
        ? "rgba(69,212,131,0.2)"
        : "rgba(255,255,255,0.08)"};

  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Card = styled.div`
  padding: 24px;
  border-radius: 20px;

  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(18px);
`;

export const CardTitle = styled.div`
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
`;

export const ProgressBar = styled.div`
  height: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: #3a7afe;
  transition: width 0.3s ease;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.6);
`;

export const Metrics = styled.div`
  display: flex;
  gap: 20px;
`;

export const Metric = styled.div`
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
`;

export const Label = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

export const Value = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-top: 6px;
`;

export const Logs = styled.div`
  max-height: 260px;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Log = styled.div`
  font-family: monospace;
  font-size: 12px;

  color: rgba(255, 255, 255, 0.7);
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 10px;

  color: rgba(255, 255, 255, 0.7);
`;

export const PreviewBox = styled.div`
  height: 220px;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.03);

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;
`;

export const PreviewText = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
`;

export const StatusWrapper = styled.div``;

export const ResultButton = styled.button`
  margin-top: 20px;

  width: 100%;

  height: 48px;

  border: none;

  border-radius: 12px;

  background: #3a7afe;

  color: white;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;

  &:hover {
    background: #4b88ff;

    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;
