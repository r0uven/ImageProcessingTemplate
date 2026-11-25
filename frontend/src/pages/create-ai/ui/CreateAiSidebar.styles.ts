import styled from "styled-components";

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
