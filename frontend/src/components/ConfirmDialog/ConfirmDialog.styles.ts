import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;

  inset: 0;

  z-index: 1100;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 24px;

  background: rgba(4, 7, 10, 0.72);

  backdrop-filter: blur(6px);
`;

export const Dialog = styled.div`
  width: 100%;

  max-width: 440px;

  padding: 28px;

  border-radius: 24px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: #11161d;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);

  color: white;
`;

export const Title = styled.h2`
  margin: 0 0 14px;

  font-size: 22px;

  font-weight: 600;
`;

export const Message = styled.p`
  margin: 0 0 26px;

  font-size: 15px;

  line-height: 1.5;

  color: rgba(255, 255, 255, 0.65);

  overflow-wrap: anywhere;
`;

export const Actions = styled.div`
  display: flex;

  justify-content: flex-end;

  gap: 12px;
`;

const BaseButton = styled.button`
  height: 48px;

  padding: 0 22px;

  border-radius: 14px;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;

    cursor: not-allowed;
  }
`;

export const CancelButton = styled(BaseButton)`
  border: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(255, 255, 255, 0.05);

  color: white;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const ConfirmButton = styled(BaseButton)`
  border: none;

  background: #d9534f;

  color: white;

  &:hover:not(:disabled) {
    background: #e05f5b;
  }
`;
