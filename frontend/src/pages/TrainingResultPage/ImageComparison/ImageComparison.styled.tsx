import styled from "styled-components";

export const ImageContainer = styled.div`
  position: relative;

  width: 100%;

  aspect-ratio: 1;

  border-radius: 18px;

  overflow: hidden;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06);

  display: flex;

  justify-content: center;

  align-items: center;

  transition: 0.25s ease;

  img {
    width: 100%;

    height: 100%;

    object-fit: contain;

    user-select: none;

    pointer-events: none;
  }
`;

export const SwitchContainer = styled.div`
  display: flex;

  gap: 8px;

  padding: 4px;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const SwitchButton = styled.button<{
  active: boolean;
}>`
  flex: 1;

  height: 42px;

  border: none;

  border-radius: 10px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition: all 0.2s ease;

  color: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.55)")};

  background: ${({ active }) => (active ? "#3a7afe" : "transparent")};

  &:hover {
    color: white;

    background: ${({ active }) =>
      active ? "#4b88ff" : "rgba(255,255,255,0.06)"};
  }
`;

export const Caption = styled.div`
  text-align: center;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.55);

  line-height: 1.4;

  min-height: 18px;
`;

export const CardTitle = styled.h2`
  margin: 0;

  margin-bottom: 24px;

  font-size: 22px;

  font-weight: 600;
`;

export const PreviewContainer = styled.div`
  display: flex;

  flex-direction: column;

  gap: 24px;
`;
export const ImagesGrid = styled.div`
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 28px;

  align-items: start;
`;
export const ImageCard = styled.div`
  display: flex;

  flex-direction: column;

  gap: 16px;

  min-width: 0;
`;
export const ImageTitle = styled.div`
  text-align: center;

  font-weight: 600;

  color: rgba(255, 255, 255, 0.8);
`;
export const ImageWrapper = styled.div`
  aspect-ratio: 1;

  border-radius: 18px;

  overflow: hidden;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06);

  display: flex;

  justify-content: center;

  align-items: center;

  img {
    width: 100%;

    height: 100%;

    object-fit: contain;
  }
`;
export const PerImageMetrics = styled.div`
  display: flex;

  justify-content: center;

  gap: 18px;

  margin-top: 8px;
`;
export const PerImageMetric = styled.div`
  padding: 10px 16px;

  border-radius: 12px;

  background: rgba(58, 122, 255, 0.12);

  border: 1px solid rgba(58, 122, 255, 0.2);

  font-size: 14px;
`;
export const Navigation = styled.div`
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;
`;
export const NavButton = styled.button`
  border: none;

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.06);

  color: white;

  padding: 12px 20px;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: rgba(58, 122, 255, 0.8);
  }

  &:disabled {
    opacity: 0.35;

    cursor: not-allowed;
  }
`;
export const ImageCounter = styled.div`
  font-size: 15px;

  color: rgba(255, 255, 255, 0.6);
`;
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Labels = styled.div`
  display: flex;
  justify-content: space-between;

  color: rgba(255, 255, 255, 0.7);

  font-size: 13px;

  font-weight: 600;
`;

export const Viewer = styled.div`
  position: relative;

  aspect-ratio: 1;

  overflow: hidden;

  border-radius: 18px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  cursor: ew-resize;

  user-select: none;
`;

export const BaseImage = styled.img`
  position: absolute;

  inset: 0;

  width: 100%;

  height: 100%;

  object-fit: cover;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

export const OverlayImage = styled.img`
  position: absolute;

  left: 0;

  top: 0;

  width: 100%;

  height: 100%;

  object-fit: cover;
`;

export const Divider = styled.div`
  position: absolute;

  top: 0;

  bottom: 0;

  width: 2px;

  background: white;

  transform: translateX(-1px);

  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);

  pointer-events: none;
`;

export const Handle = styled.div`
  position: absolute;

  top: 50%;

  width: 34px;

  height: 34px;

  border-radius: 50%;

  transform: translate(-50%, -50%);

  background: white;

  color: black;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 16px;

  font-weight: bold;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

  pointer-events: none;
`;
