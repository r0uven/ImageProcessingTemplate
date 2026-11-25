import styled from "styled-components";

export const Toolbar = styled.div`
  position: sticky;

  top: 14px;

  z-index: 20;

  margin-left: 0;

  display: flex;

  align-items: center;

  gap: 12px;

  flex-wrap: wrap;

  padding: 12px;

  margin-bottom: 18px;

  border-radius: 16px;

  border: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(11, 15, 20, 0.9);

  backdrop-filter: blur(14px);

  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);

  transition: margin-left 0.18s ease;

  &[data-stuck="true"] {
    margin-left: 76px;
  }

  @media (max-width: 720px) {
    top: 84px;

    &[data-stuck="true"] {
      margin-left: 0;
    }
  }
`;

export const SearchBox = styled.div`
  position: relative;

  flex: 1 1 320px;

  min-width: 220px;
`;

export const SearchInput = styled.input`
  box-sizing: border-box;

  width: 100%;

  padding: 11px 42px 11px 14px;

  border-radius: 12px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(0, 0, 0, 0.3);

  color: white;

  font-size: 14px;

  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.38);
  }

  &:focus {
    border-color: rgba(58, 122, 254, 0.7);
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

export const ClearSearch = styled.button`
  position: absolute;

  top: 50%;

  right: 8px;

  transform: translateY(-50%);

  width: 26px;

  height: 26px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  border-radius: 8px;

  background: rgba(255, 255, 255, 0.08);

  color: rgba(255, 255, 255, 0.7);

  font-size: 17px;

  line-height: 1;

  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.16);

    color: white;
  }
`;

export const ToolbarActions = styled.div`
  display: flex;

  gap: 8px;

  flex-wrap: wrap;
`;

export const ToolbarButton = styled.button`
  padding: 9px 12px;

  border-radius: 10px;

  border: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(255, 255, 255, 0.04);

  color: rgba(255, 255, 255, 0.72);

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  white-space: nowrap;

  &:hover {
    border-color: rgba(58, 122, 254, 0.5);

    color: white;
  }
`;
