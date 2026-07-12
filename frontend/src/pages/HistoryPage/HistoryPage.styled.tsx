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
`;

export const Content = styled.div`
  max-width: 1400px;

  width: 100%;

  box-sizing: border-box;

  margin: 0 auto;

  padding: 72px;
`;

export const Header = styled.div`
  margin-bottom: 42px;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 40px;

  font-weight: 700;

  letter-spacing: -1px;
`;

export const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.6);

  font-size: 17px;
`;

export const CardsContainer = styled.div`
  display: flex;

  flex-direction: column;

  gap: 22px;
`;

export const Card = styled.div`
  display: flex;

  gap: 24px;

  padding: 24px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ImagePreview = styled.div`
  width: 180px;

  height: 180px;

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
`;

export const EmptyState = styled.div`
  height: 350px;

  display: flex;

  justify-content: center;

  align-items: center;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px dashed rgba(255, 255, 255, 0.08);
`;

export const EmptyText = styled.div`
  font-size: 20px;

  color: rgba(255, 255, 255, 0.45);
`;
export const Toolbar = styled.div`
  display: flex;

  align-items: center;

  gap: 20px;

  margin-bottom: 32px;

  width: 100%;
`;

export const SearchWrapper = styled.div`
  flex: 1;

  min-width: 0;
`;

export const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 52px;

  padding: 0 20px;

  border-radius: 16px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(12px);

  color: white;

  font-size: 15px;

  outline: none;

  transition: 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: rgba(58, 122, 255, 0.7);

    background: rgba(255, 255, 255, 0.06);
  }
`;

export const RightControls = styled.div`
  display: flex;

  align-items: center;

  gap: 16px;

  flex-shrink: 0;
`;

export const Filters = styled.div`
  display: flex;

  gap: 8px;

  padding: 4px;

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(12px);
`;

export const FilterButton = styled.button<{
  active: boolean;
}>`
  height: 42px;

  padding: 0 18px;

  border: none;

  border-radius: 12px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition: 0.2s;

  color: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.55)")};

  background: ${({ active }) => (active ? "#3a7afe" : "transparent")};

  &:hover {
    color: white;

    background: ${({ active }) =>
      active ? "#4b88ff" : "rgba(255,255,255,0.06)"};
  }
`;

export const SortSelect = styled.select`
  height: 50px;

  padding: 0 18px;

  border-radius: 14px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(12px);

  color: white;

  font-size: 14px;

  cursor: pointer;

  outline: none;

  transition: 0.2s;

  &:focus {
    border-color: rgba(58, 122, 255, 0.7);
  }

  option {
    background: #161b22;

    color: white;
  }
`;
