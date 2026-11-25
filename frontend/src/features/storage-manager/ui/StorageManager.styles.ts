import styled from "styled-components";

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
