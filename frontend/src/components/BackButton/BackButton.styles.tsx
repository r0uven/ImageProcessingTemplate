import styled from "styled-components";

export const BackButtonContainer = styled.button`
  position: fixed;

  top: 24px;
  left: 24px;

  z-index: 1000;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 12px 18px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  border-radius: 16px;

  background: rgba(20, 20, 20, 0.75);

  backdrop-filter: blur(12px);

  color: white;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);

  &:hover {
    transform: translateY(-2px);

    background: rgba(35, 35, 35, 0.9);

    border-color: rgba(255, 255, 255, 0.16);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const BackIcon = styled.span`
  font-size: 18px;

  line-height: 1;
`;

export const BackText = styled.span`
  font-size: 14px;

  font-weight: 500;

  letter-spacing: 0.3px;
`;
