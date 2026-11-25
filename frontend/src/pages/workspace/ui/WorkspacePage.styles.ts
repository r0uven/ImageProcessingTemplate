import styled from "styled-components";

import { scrollbar } from "@/shared/styles/mixins";
import { colors, spacing } from "@/shared/styles/tokens";

export const Layout = styled.div`
  flex: 1;
  display: flex;
  background: transparent;
`;

export const LeftPanel = styled.div`
  width: 380px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.border};
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
`;

export const ViewerPanel = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const SettingsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.xxl}px;
  padding-top: 80px;
  ${scrollbar};
`;

export const ActionArea = styled.div`
  padding: ${spacing.xl}px;
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
`;
