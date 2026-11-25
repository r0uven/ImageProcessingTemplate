import styled from "styled-components";

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

export const FeaturesHint = styled.div`
  font-size: 13px;

  line-height: 1.4;

  color: rgba(255, 255, 255, 0.5);

  text-align: center;
`;
