import styled from "styled-components";

export const FieldsGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

  gap: 16px 22px;

  min-width: 0;
`;

export const FieldRow = styled.label`
  display: flex;

  flex-direction: column;

  gap: 7px;

  min-width: 0;
`;

export const Label = styled.span`
  font-size: 13px;

  font-weight: 600;

  color: rgba(255, 255, 255, 0.82);
`;

export const PathHint = styled.span`
  display: block;

  font-size: 11px;

  color: rgba(255, 255, 255, 0.3);

  font-family: "Cascadia Code", "Consolas", monospace;

  white-space: normal;

  overflow-wrap: anywhere;

  word-break: break-word;
`;

export const Input = styled.input`
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

export const Select = styled.select`
  box-sizing: border-box;

  width: 100%;

  padding: 10px 12px;

  border-radius: 11px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(0, 0, 0, 0.28);

  color: white;

  font-size: 14px;

  outline: none;
`;

export const TextArea = styled.textarea`
  box-sizing: border-box;

  width: 100%;

  min-height: 110px;

  padding: 10px 12px;

  border-radius: 11px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(0, 0, 0, 0.28);

  color: white;

  font-family: "Cascadia Code", "Consolas", monospace;

  font-size: 13px;

  line-height: 1.5;

  resize: vertical;

  outline: none;

  &:focus {
    border-color: rgba(58, 122, 254, 0.7);
  }
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

export const GroupBox = styled.div`
  grid-column: 1 / -1;

  min-width: 0;

  padding: 16px 18px;

  border-radius: 16px;

  border: 1px solid rgba(255, 255, 255, 0.06);

  border-left: 3px solid rgba(58, 122, 254, 0.55);

  background: rgba(0, 0, 0, 0.16);

  display: flex;

  flex-direction: column;

  gap: 14px;
`;

export const GroupTitle = styled.div`
  font-size: 14px;

  font-weight: 650;

  color: rgba(255, 255, 255, 0.78);
`;

export const ArrayField = styled.div`
  display: flex;

  flex-direction: column;

  gap: 8px;

  grid-column: 1 / -1;
`;

export const ArrayRow = styled.div`
  display: flex;

  align-items: center;

  gap: 8px;
`;

export const ArrayInput = styled(Input)`
  flex: 1;
`;

export const IconButton = styled.button`
  flex: 0 0 auto;

  width: 34px;

  height: 34px;

  border-radius: 10px;

  border: 1px solid rgba(255, 93, 93, 0.3);

  background: rgba(255, 93, 93, 0.1);

  color: #ffb4b4;

  cursor: pointer;

  font-size: 14px;

  line-height: 1;

  &:hover {
    background: rgba(255, 93, 93, 0.18);
  }
`;

export const AddButton = styled.button`
  align-self: flex-start;

  padding: 7px 12px;

  border-radius: 10px;

  border: 1px dashed rgba(255, 255, 255, 0.2);

  background: transparent;

  color: rgba(255, 255, 255, 0.7);

  font-size: 13px;

  cursor: pointer;

  &:hover {
    border-color: rgba(58, 122, 254, 0.6);

    color: white;
  }
`;

export const EmptyText = styled.div`
  font-size: 13px;

  color: rgba(255, 255, 255, 0.4);
`;

export const JsonError = styled.div`
  font-size: 12px;

  color: #ff9d9d;
`;
