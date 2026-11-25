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
  max-width: 1200px;

  width: 100%;

  box-sizing: border-box;

  margin: 0 auto;

  padding: 72px 48px 140px;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 24px;

  margin-bottom: 32px;

  flex-wrap: wrap;
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

  font-size: 16px;

  max-width: 720px;

  line-height: 1.5;
`;

export const ActionBar = styled.div`
  position: fixed;

  left: 0;
  right: 0;
  bottom: 0;

  z-index: 50;

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 12px;

  flex-wrap: wrap;

  padding: 14px 24px;

  background: rgba(11, 15, 20, 0.9);

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(16px);

  box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.3);
`;

export const ActionBarStatus = styled.div<{
  $dirty?: boolean;
  $error?: boolean;
}>`
  display: flex;

  align-items: center;

  gap: 8px;

  margin-right: auto;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.55);

  &::before {
    content: "";

    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: ${({ $dirty, $error }) =>
      $error ? "#ff5d5d" : $dirty ? "#f0b35b" : "rgba(74, 222, 128, 0.85)"};
  }
`;

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

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 20px;

  border-radius: 14px;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  border: 1px solid
    ${({ $primary }) =>
      $primary ? "transparent" : "rgba(255, 255, 255, 0.12)"};

  background: ${({ $primary }) =>
    $primary ? "#3a7afe" : "rgba(255, 255, 255, 0.05)"};

  color: white;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);

    background: ${({ $primary }) =>
      $primary ? "#4b88ff" : "rgba(255, 255, 255, 0.09)"};
  }

  &:disabled {
    opacity: 0.45;

    cursor: not-allowed;
  }
`;

export const MetaCard = styled.div`
  padding: 18px 22px;

  border-radius: 18px;

  border: 1px solid rgba(255, 255, 255, 0.07);

  background: rgba(255, 255, 255, 0.03);

  display: flex;

  flex-direction: column;

  gap: 8px;

  margin-bottom: 18px;
`;

export const MetaRow = styled.div`
  display: flex;

  gap: 10px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.62);

  flex-wrap: wrap;

  word-break: break-all;

  strong {
    color: rgba(255, 255, 255, 0.85);

    font-weight: 600;
  }

  code {
    font-family: "Cascadia Code", "Consolas", monospace;

    color: rgba(255, 255, 255, 0.82);
  }
`;

export const Message = styled.div<{ $error?: boolean }>`
  padding: 14px 18px;

  border-radius: 14px;

  margin-bottom: 18px;

  font-size: 14px;

  white-space: pre-wrap;

  border: 1px solid
    ${({ $error }) =>
      $error ? "rgba(255, 93, 93, 0.35)" : "rgba(74, 222, 128, 0.3)"};

  background: ${({ $error }) =>
    $error ? "rgba(255, 93, 93, 0.1)" : "rgba(74, 222, 128, 0.1)"};

  color: ${({ $error }) => ($error ? "#ffb4b4" : "#b9f6ca")};
`;

export const SearchHint = styled.div`
  margin: -4px 0 18px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.48);
`;

export const EmptyState = styled.div`
  padding: 44px 24px;

  border-radius: 20px;

  border: 1px dashed rgba(255, 255, 255, 0.14);

  background: rgba(255, 255, 255, 0.02);

  text-align: center;

  font-size: 15px;

  color: rgba(255, 255, 255, 0.55);
`;

export const SectionCard = styled.section<{ $open: boolean }>`
  padding: ${({ $open }) => ($open ? "22px 24px 24px" : "16px 24px")};

  border-radius: 22px;

  border: 1px solid rgba(255, 255, 255, 0.07);

  background: rgba(255, 255, 255, 0.035);

  margin-bottom: 14px;

  transition:
    padding 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const SectionHeaderButton = styled.button`
  box-sizing: border-box;

  display: flex;

  width: 100%;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  padding: 0;

  border: none;

  background: transparent;

  color: inherit;

  text-align: left;

  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(58, 122, 254, 0.8);

    outline-offset: 6px;

    border-radius: 8px;
  }
`;

export const SectionHeading = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 0;
`;

export const SectionChevron = styled.span<{ $open: boolean }>`
  flex: 0 0 auto;

  font-size: 15px;

  line-height: 1;

  color: rgba(255, 255, 255, 0.45);

  transition: transform 0.2s ease;

  transform: rotate(${({ $open }) => ($open ? 90 : 0)}deg);
`;

export const SectionTitle = styled.div`
  min-width: 0;

  font-size: 20px;

  font-weight: 650;

  letter-spacing: -0.3px;
`;

export const SectionMeta = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  flex-wrap: wrap;

  justify-content: flex-end;
`;

export const SectionCount = styled.span`
  padding: 4px 8px;

  border-radius: 999px;

  background: rgba(255, 255, 255, 0.06);

  font-size: 11px;

  color: rgba(255, 255, 255, 0.5);

  white-space: nowrap;
`;

export const SectionKey = styled.code`
  font-size: 12px;

  color: rgba(255, 255, 255, 0.35);

  font-family: "Cascadia Code", "Consolas", monospace;

  white-space: nowrap;
`;

export const SectionBody = styled.div`
  margin-top: 20px;

  padding-top: 18px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

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

/* ------------------------------------------------------------------ */
/* Реестр хранилищ                                                     */
/* ------------------------------------------------------------------ */

export const StorageSection = styled.div`
  display: flex;

  flex-direction: column;

  gap: 20px;

  margin-bottom: 24px;
`;

export const StorageList = styled.div`
  display: flex;

  flex-direction: column;

  gap: 14px;
`;

export const StorageCard = styled.article<{ $active?: boolean }>`
  display: flex;

  flex-direction: column;

  gap: 14px;

  padding: 18px 20px;

  border-radius: 16px;

  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(58, 122, 254, 0.55)" : "rgba(255, 255, 255, 0.07)"};

  background: ${({ $active }) =>
    $active ? "rgba(58, 122, 254, 0.1)" : "rgba(0, 0, 0, 0.18)"};
`;

export const StorageHeader = styled.div`
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;
`;

export const StorageTitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 6px;

  min-width: 0;
`;

export const StorageNameRow = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  flex-wrap: wrap;
`;

export const StorageName = styled.span`
  font-size: 15px;

  font-weight: 650;

  color: white;
`;

export const StorageId = styled.span`
  font-size: 12px;

  color: rgba(255, 255, 255, 0.35);
`;

export const StoragePath = styled.code`
  font-size: 12px;

  line-height: 1.5;

  color: rgba(255, 255, 255, 0.6);

  overflow-wrap: anywhere;
`;

export const StorageBadges = styled.div`
  display: flex;

  gap: 8px;

  flex-wrap: wrap;
`;

export const StorageBadge = styled.span<{
  $tone?: "active" | "ok" | "warn" | "muted";
}>`
  padding: 4px 10px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 600;

  white-space: nowrap;

  ${({ $tone = "muted" }) => {
    if ($tone === "active") {
      return `
        border: 1px solid rgba(58, 122, 254, 0.5);
        background: rgba(58, 122, 254, 0.18);
        color: #9dc0ff;
      `;
    }

    if ($tone === "ok") {
      return `
        border: 1px solid rgba(80, 200, 140, 0.35);
        background: rgba(80, 200, 140, 0.12);
        color: #8fe3b6;
      `;
    }

    if ($tone === "warn") {
      return `
        border: 1px solid rgba(255, 190, 80, 0.4);
        background: rgba(255, 190, 80, 0.12);
        color: #ffd28a;
      `;
    }

    return `
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.55);
    `;
  }}
`;

export const StorageStats = styled.div`
  display: flex;

  flex-wrap: wrap;

  gap: 8px 20px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.55);
`;

export const StorageActions = styled.div`
  display: flex;

  flex-wrap: wrap;

  gap: 8px;
`;

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
