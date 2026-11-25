import styled from "styled-components";

export const Control = styled.label`
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 7px 12px;

  border-radius: 12px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.03);

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.55);

  white-space: nowrap;
`;

export const Select = styled.select`
  height: 30px;

  padding: 0 8px;

  border-radius: 8px;

  border: 1px solid rgba(58, 122, 254, 0.35);

  background: #151b24;

  color: white;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(58, 122, 254, 0.8);

    outline-offset: 1px;
  }

  option {
    background: #151b24;

    color: white;
  }
`;
