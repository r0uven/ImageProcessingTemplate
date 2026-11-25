import styled from "styled-components";

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

export const UploadOverlay = styled.div`
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
