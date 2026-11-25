import styled from "styled-components";

export const Card = styled.div`
  display: flex;

  gap: 24px;

  padding: 24px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ImagePreview = styled.div`
  width: 240px;

  height: 240px;

  flex-shrink: 0;

  border-radius: 18px;

  overflow: hidden;

  background: rgba(255, 255, 255, 0.03);

  img {
    width: 100%;

    height: 100%;

    object-fit: cover;
  }
`;

export const CardContent = styled.div`
  flex: 1;

  display: flex;

  flex-direction: column;
`;

export const CardHeader = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 24px;
`;

export const FileName = styled.div`
  font-size: 22px;

  font-weight: 600;
`;

export const Status = styled.div<{
  success: boolean;
}>`
  padding: 8px 16px;

  border-radius: 999px;

  font-size: 13px;

  font-weight: 600;

  color: ${({ success }) => (success ? "#57d98d" : "#ff7070")};

  background: ${({ success }) =>
    success ? "rgba(87,217,141,0.12)" : "rgba(255,112,112,0.12)"};

  border: 1px solid
    ${({ success }) =>
      success ? "rgba(87,217,141,0.3)" : "rgba(255,112,112,0.3)"};
`;

export const CardActions = styled.div`
  display: flex;

  align-items: center;

  gap: 12px;
`;

export const DeleteButton = styled.button`
  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border: 1px solid rgba(255, 255, 255, 0.08);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.05);

  color: rgba(255, 255, 255, 0.7);

  cursor: pointer;

  transition: all 0.2s ease;

  svg {
    width: 19px;

    height: 19px;
  }

  &:hover {
    background: rgba(220, 70, 70, 0.9);

    border-color: rgba(220, 70, 70, 0.4);

    color: white;

    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const InfoGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 24px;
`;

export const InfoItem = styled.div`
  display: flex;

  flex-direction: column;

  gap: 8px;
`;

export const Label = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.45);
`;

export const Value = styled.div`
  font-size: 16px;

  font-weight: 500;
`;

export const Actions = styled.div`
  margin-top: 28px;

  display: flex;

  justify-content: flex-end;
  padding-top: 24px;
`;

export const ViewButton = styled.button`
  border: none;

  border-radius: 14px;

  background: #3a7afe;

  color: white;

  padding: 13px 24px;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

  &:hover {
    background: #4a87ff;

    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.08);

    color: rgba(255, 255, 255, 0.4);

    cursor: not-allowed;

    transform: none;
  }
`;

export const NoPreview = styled.div`
  width: 100%;

  height: 100%;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 14px;

  color: rgba(255, 255, 255, 0.35);
`;

export const FailureReason = styled.div`
  margin: 0 0 18px;

  padding: 10px 14px;

  border-radius: 12px;

  border: 1px solid rgba(255, 112, 112, 0.25);

  background: rgba(255, 112, 112, 0.08);

  color: #ff9d9d;

  font-size: 13px;

  line-height: 1.45;

  overflow-wrap: anywhere;
`;
