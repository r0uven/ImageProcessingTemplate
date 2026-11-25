import styled from "styled-components";

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

export const StorageSection = styled.div`
  display: flex;

  flex-direction: column;

  gap: 20px;

  margin-bottom: 24px;
`;
