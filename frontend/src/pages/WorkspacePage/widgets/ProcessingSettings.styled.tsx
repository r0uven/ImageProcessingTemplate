import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;

  gap: 14px;
  margin-bottom: 22px;

  padding: 18px;

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(12px);
`;

export const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;

  letter-spacing: 0.3px;

  color: rgba(255, 255, 255, 0.85);

  margin: 0;
`;

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 14px 16px;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);

  transition: 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);

  cursor: pointer;

  min-width: 0; /* 🔥 критично */

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  input {
    flex-shrink: 0;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }

  input,
  select {
    height: 34px;
    border-radius: 10px;

    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.25);

    color: white;

    padding: 0 10px;

    outline: none;

    transition: 0.2s ease;

    &:focus {
      border-color: rgba(124, 92, 255, 0.6);
    }
  }
`;
