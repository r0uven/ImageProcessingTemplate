import styled from "styled-components";

export const DatasetContainer = styled.div`
  display: flex;

  flex-direction: column;

  gap: 20px;
`;

export const DatasetPair = styled.div`
  padding: 20px;

  border-radius: 18px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const PairHeader = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 16px;
`;

export const PairTitle = styled.div`
  font-weight: 600;
`;

export const PairReady = styled.div`
  color: #45d483;

  font-size: 14px;
`;

export const UploadGrid = styled.div`
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 16px;
`;

export const UploadArea = styled.label`
  height: 180px;

  border-radius: 18px;

  border: 2px dashed rgba(255, 255, 255, 0.1);

  background: rgba(255, 255, 255, 0.02);

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    border-color: rgba(58, 122, 255, 0.8);

    background: rgba(58, 122, 255, 0.05);
  }
`;

export const UploadTitle = styled.div`
  font-weight: 600;

  margin-bottom: 8px;
`;

export const UploadHint = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.5);
`;

export const PreviewImage = styled.img`
  width: 100%;

  height: 180px;

  object-fit: cover;

  border-radius: 18px;
`;

export const HiddenInput = styled.input`
  display: none;
`;
