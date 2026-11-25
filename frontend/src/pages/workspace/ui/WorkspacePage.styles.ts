import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;

  display: flex;

  flex-direction: column;

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

export const Layout = styled.div`
  flex: 1;

  display: flex;

  background: transparent;
`;

export const LeftPanel = styled.div`
  width: 380px;

  display: flex;

  flex-direction: column;

  border-right: 1px solid rgba(255, 255, 255, 0.06);

  background: rgba(255, 255, 255, 0.02);

  backdrop-filter: blur(12px);
`;

export const ViewerPanel = styled.div`
  flex: 1;

  position: relative;

  display: flex;

  flex-direction: column;
`;

export const SettingsContent = styled.div`
  flex: 1;

  overflow-y: auto;

  padding: 24px;
  padding-top: 80px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);

    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
`;

export const ActionArea = styled.div`
  padding: 20px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);

  display: flex;

  flex-direction: column;

  gap: 12px;
`;

