import styled from "styled-components";

export const SmallButton = styled.button<{
  $danger?: boolean;
  $primary?: boolean;
}>`
  padding: 8px 14px;

  border-radius: 10px;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:disabled {
    opacity: 0.5;

    cursor: not-allowed;
  }

  ${({ $danger, $primary }) => {
    if ($danger) {
      return `
        border: 1px solid rgba(255, 93, 93, 0.32);
        background: rgba(255, 93, 93, 0.1);
        color: #ffb4b4;

        &:hover:not(:disabled) {
          background: rgba(255, 93, 93, 0.2);
        }
      `;
    }

    if ($primary) {
      return `
        border: 1px solid rgba(58, 122, 254, 0.5);
        background: rgba(58, 122, 254, 0.2);
        color: #cfe0ff;

        &:hover:not(:disabled) {
          background: rgba(58, 122, 254, 0.32);
        }
      `;
    }

    return `
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.8);

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
      }
    `;
  }}
`;

export const StorageForm = styled.div`
  display: flex;

  flex-direction: column;

  gap: 12px;

  padding: 18px 20px;

  border-radius: 16px;

  border: 1px dashed rgba(255, 255, 255, 0.14);

  background: rgba(0, 0, 0, 0.16);
`;

export const FormTitle = styled.div`
  font-size: 14px;

  font-weight: 650;

  color: rgba(255, 255, 255, 0.8);
`;

export const FormRow = styled.div`
  display: flex;

  gap: 10px;

  flex-wrap: wrap;

  align-items: center;
`;

const Input = styled.input`
  box-sizing: border-box;

  width: 100%;

  padding: 10px 12px;

  border-radius: 11px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(0, 0, 0, 0.28);

  color: white;

  font-size: 14px;

  outline: none;

  &:focus {
    border-color: rgba(58, 122, 254, 0.7);
  }
`;

export const FormInput = styled(Input)`
  flex: 1;

  min-width: 220px;
`;

export const FormActions = styled.div`
  display: flex;

  gap: 10px;

  flex-wrap: wrap;

  align-items: center;
`;

export const FormHint = styled.div`
  font-size: 12px;

  line-height: 1.5;

  color: rgba(255, 49, 49, 0.75);
`;

export const StorageMessage = styled.div<{ $error?: boolean }>`
  padding: 10px 14px;

  border-radius: 11px;

  font-size: 13px;

  line-height: 1.45;

  overflow-wrap: anywhere;

  border: 1px solid
    ${({ $error }) =>
      $error ? "rgba(255, 93, 93, 0.3)" : "rgba(80, 200, 140, 0.28)"};

  background: ${({ $error }) =>
    $error ? "rgba(255, 93, 93, 0.1)" : "rgba(80, 200, 140, 0.08)"};

  color: ${({ $error }) => ($error ? "#ffb4b4" : "#8fe3b6")};
`;

export const StorageInlineForm = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;

  padding: 14px 16px;

  border-radius: 14px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(0, 0, 0, 0.22);
`;

export const DialogChecks = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;

  margin: 0 0 22px;
`;

export const DialogHint = styled.div`
  margin: -8px 0 20px;

  font-size: 12px;

  line-height: 1.5;

  color: rgba(255, 255, 255, 0.45);
`;

export const CheckboxRow = styled.label`
  display: flex;

  box-sizing: border-box;

  width: 100%;

  min-width: 0;

  align-items: flex-start;

  gap: 10px;

  padding: 10px 12px;

  border-radius: 11px;

  border: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(0, 0, 0, 0.22);

  cursor: pointer;

  font-size: 14px;

  color: rgba(255, 255, 255, 0.85);

  & > span {
    flex: 1;

    min-width: 0;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }
`;

export const Checkbox = styled.input`
  flex: 0 0 auto;

  width: 16px;

  height: 16px;

  margin-top: 2px;

  accent-color: #3a7afe;

  cursor: pointer;
`;