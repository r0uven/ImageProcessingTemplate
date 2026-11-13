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

export const UploadIcon = styled.div`
  font-size: 120px;

  color: rgba(255, 255, 255, 0.15);

  margin-bottom: 16px;
`;

export const UploadText = styled.div`
  font-size: 22px;

  font-weight: 500;

  color: rgba(255, 255, 255, 0.85);
`;

export const UploadHint = styled.div`
  margin-top: 10px;

  font-size: 15px;

  color: rgba(255, 255, 255, 0.45);
`;

export const ViewerHeader = styled.div`
  position: absolute;

  top: 20px;
  right: 20px;

  display: flex;

  align-items: center;

  gap: 12px;

  z-index: 20;
`;

export const ClearButton = styled.button`
  width: 42px;

  height: 42px;

  border: none;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.08);

  color: white;

  cursor: pointer;

  transition: all 0.2s ease;

  display: flex;

  align-items: center;

  justify-content: center;

  &:hover {
    background: rgba(220, 70, 70, 0.9);

    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const UploadOverlay = styled.label`
  flex: 1;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  cursor: pointer;

  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.01);
  }
`;

export const ImageWrapper = styled.div`
  flex: 1;

  padding: 24px;

  display: flex;

  align-items: center;

  justify-content: center;

  overflow: hidden;

  img {
    max-width: 90%;

    max-height: 90%;

    object-fit: contain;

    border-radius: 8px;
  }
`;

export const ToolBar = styled.div`
  position: absolute;

  bottom: 20px;

  left: 50%;

  transform: translateX(-50%);

  display: flex;

  gap: 10px;

  padding: 10px;

  border-radius: 18px;

  backdrop-filter: blur(12px);

  background: rgba(0, 0, 0, 0.5);

  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const ToolButton = styled.button`
  width: 42px;

  height: 42px;

  border: none;

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.06);

  color: white;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

export const ProcessButton = styled.button`
  height: 52px;

  border: none;

  border-radius: 14px;

  background: #3a7afe;

  color: white;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #4a87ff;

    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;

    cursor: not-allowed;
  }
`;

export const FeaturesButton = styled.button`
  height: 52px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.05);

  backdrop-filter: blur(12px);

  color: white;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);

    border-color: rgba(255, 255, 255, 0.16);

    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.4;

    cursor: not-allowed;
  }
`;

export const ModeSwitchContainer = styled.div`
  display: flex;

  padding: 4px;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ModeButton = styled.button<{ active?: boolean }>`
  padding: 10px 16px;

  border: none;

  border-radius: 12px;

  cursor: pointer;

  font-size: 13px;

  font-weight: 500;

  color: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.6)")};

  background: ${({ active }) =>
    active ? "rgba(58, 122, 255, 0.9)" : "transparent"};

  transition: all 0.2s ease;

  &:hover {
    color: white;

    background: ${({ active }) =>
      active ? "rgba(58, 122, 255, 0.9)" : "rgba(255, 255, 255, 0.06)"};
  }
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

