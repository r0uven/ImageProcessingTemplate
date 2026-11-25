import styled from "styled-components";

import { pageBackground } from "@/shared/styles/mixins";
import { spacing } from "@/shared/styles/tokens";

export const Page = styled.div`
  ${pageBackground};

  display: flex;
  flex-direction: column;
`;

export const PageContent = styled.div<{
  $maxWidth?: string;
  $padding?: string;
  $flex?: boolean;
}>`
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: ${({ $maxWidth = "1400px" }) => $maxWidth};
  padding: ${({ $padding = "72px 48px" }) => $padding};

  ${({ $flex }) => $flex && "flex: 1;"}
`;

export const PageHeader = styled.div<{
  $marginBottom?: string;
  $align?: "start" | "center";
}>`
  display: flex;
  align-items: ${({ $align = "start" }) =>
    $align === "center" ? "center" : "flex-start"};
  justify-content: space-between;
  gap: ${spacing.xxl}px;
  margin-bottom: ${({ $marginBottom = "32px" }) => $marginBottom};
  flex-wrap: wrap;
`;

export const PageTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm + 2}px;
  min-width: 0;
`;
