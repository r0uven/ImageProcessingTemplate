// CreateAiPage.styles.ts

import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;

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

  overflow-y: auto;
`;

export const Content = styled.div`
  max-width: 1400px;

  margin: 0 auto;

  padding: 48px;

  padding-top: 72px;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 40px;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 8px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 42px;

  font-weight: 700;
`;

export const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.6);
`;

export const Layout = styled.div`
  display: grid;

  grid-template-columns: 1fr 340px;

  gap: 24px;
`;

export const MainColumn = styled.div`
  display: flex;

  flex-direction: column;

  gap: 24px;
`;

export const Sidebar = styled.div`
  position: sticky;

  top: 24px;

  height: fit-content;
`;

export const Card = styled.div`
  padding: 24px;

  border-radius: 24px;

  backdrop-filter: blur(20px);

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const CardTitle = styled.div`
  font-size: 18px;

  font-weight: 600;

  margin-bottom: 20px;
`;

export const FieldsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 16px;
`;

export const Field = styled.div`
  display: flex;

  flex-direction: column;

  gap: 8px;
`;

export const Label = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.6);
`;

export const Input = styled.input`
  height: 52px;

  border-radius: 14px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.04);

  color: white;

  padding: 0 16px;

  outline: none;

  transition: 0.2s;

  &:focus {
    border-color: rgba(58, 122, 255, 0.8);

    box-shadow: 0 0 0 4px rgba(58, 122, 255, 0.15);
  }
`;

export const TextArea = styled.textarea`
  min-height: 140px;

  border-radius: 14px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.04);

  color: white;

  padding: 16px;

  resize: vertical;

  outline: none;

  &:focus {
    border-color: rgba(58, 122, 255, 0.8);

    box-shadow: 0 0 0 4px rgba(58, 122, 255, 0.15);
  }
`;

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

export const StatsList = styled.div`
  display: flex;

  flex-direction: column;

  gap: 16px;
`;

export const StatRow = styled.div`
  display: flex;

  justify-content: space-between;
`;

export const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
`;

export const StatValue = styled.div`
  font-weight: 600;
`;

export const CreateButton = styled.button`
  width: 100%;

  height: 56px;

  margin-top: 24px;

  border: none;

  border-radius: 16px;

  background: #3a7afe;

  color: white;

  font-size: 16px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);

    background: #4c87ff;
  }
`;

export const BackButton = styled.button`
  border: none;

  background: rgba(255, 255, 255, 0.05);

  color: white;

  padding: 12px 18px;

  border-radius: 14px;

  cursor: pointer;
`;
