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
