import styled from "styled-components";

export const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;

  background: #0b0f14;
  color: white;
`;

export const Header = styled.div`
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 20px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const Title = styled.div`
  font-weight: 600;
`;

export const Layout = styled.div`
  height: 100vh;

  display: flex;

  background: #0b0f14;
`;

export const LeftPanel = styled.div`
  width: 380px;

  display: flex;

  flex-direction: column;

  border-right: 1px solid rgba(255, 255, 255, 0.06);

  background: rgba(255, 255, 255, 0.02);
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  font-size: 13px;
  opacity: 0.6;
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
`;

export const UploadHint = styled.div`
  margin-top: 10px;

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

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.06);

  color: white;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: rgba(220, 70, 70, 0.9);
  }
`;

export const UploadOverlay = styled.label`
  flex: 1;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  cursor: pointer;
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
  height: 48px;

  border: none;

  border-radius: 12px;

  background: #3a7afe;

  color: white;

  font-weight: 600;

  cursor: pointer;
`;

export const FeaturesButton = styled.button`
  height: 48px;

  border: none;

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.06);

  color: white;

  font-weight: 600;

  cursor: pointer;
`;

export const BottomBar = styled.div`
  height: 70px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);

  display: flex;
  justify-content: flex-end;
  align-items: center;

  padding: 0 20px;

  gap: 12px;
`;

export const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 10px 16px;

  border-radius: 10px;

  border: none;

  cursor: pointer;

  background: ${({ primary }) =>
    primary ? "#3a7afe" : "rgba(255,255,255,0.06)"};

  color: white;
`;

export const ModeSwitchContainer = styled.div`
  display: flex;

  padding: 4px;

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ModeButton = styled.button<{ active?: boolean }>`
  padding: 8px 14px;

  border: none;

  border-radius: 10px;

  cursor: pointer;

  font-size: 13px;

  color: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.6)")};

  background: ${({ active }) =>
    active ? "rgba(58, 122, 255, 0.9)" : "transparent"};

  transition: all 0.2s ease;

  &:hover {
    color: white;
  }
`;

export const SettingsContent = styled.div`
  flex: 1;

  overflow-y: auto;

  padding: 24px;
  padding-top: 80px; /* 👈 место под BackButton */
  padding-left: 24px; /* можно увеличить если нужно */
`;

export const ActionArea = styled.div`
  padding: 20px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);

  display: flex;

  flex-direction: column;

  gap: 12px;
`;
