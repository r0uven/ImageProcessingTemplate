import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;

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

  display: flex;
  flex-direction: column;
`;
export const Content = styled.div`
  flex: 1;

  padding: 48px;

  overflow-y: auto;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 70px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 42px;

  font-weight: 700;

  letter-spacing: -1px;

  line-height: 1.1;

  max-width: 700px;
`;

export const HistoryButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.05);

  backdrop-filter: blur(12px);

  color: white;

  padding: 14px 22px;

  border-radius: 18px;

  font-size: 15px;

  font-weight: 500;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);

    background: rgba(255, 255, 255, 0.08);

    border-color: rgba(255, 255, 255, 0.16);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CardsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, 320px);

  justify-content: center;

  gap: 32px;

  margin-top: 30px;
`;

export const BottomText = styled.h2`
  text-align: center;

  margin-top: 80px;

  font-size: 30px;

  font-weight: 400;

  color: rgba(255, 255, 255, 0.72);

  letter-spacing: 0.3px;
`;
