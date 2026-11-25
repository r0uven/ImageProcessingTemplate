import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { Message } from "@/shared/ui/message";
import {
  colors,
  radii,
  spacing,
  typography,
  zIndex,
} from "@/shared/styles/tokens";

export const ActionBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${zIndex.actionBar};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.md}px;
  flex-wrap: wrap;
  padding: 14px ${spacing.xxl}px;
  background: rgba(11, 15, 20, 0.9);
  border-top: 1px solid ${colors.borderFaint};
  backdrop-filter: blur(16px);
  box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.3);
`;

export const ActionBarStatus = styled.div<{
  $dirty?: boolean;
  $error?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  margin-right: auto;
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textMuted};

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $dirty, $error }) =>
      $error ? colors.danger : $dirty ? colors.warning : colors.success};
  }
`;

export const MetaCard = styled(Card)`
  margin-bottom: ${spacing.lg + 2}px;
`;

export const MetaRow = styled.div`
  display: flex;
  gap: ${spacing.sm + 2}px;
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textMuted};
  flex-wrap: wrap;
  word-break: break-all;

  strong {
    color: ${colors.textSecondary};
    font-weight: ${typography.weights.semibold};
  }

  code {
    font-family: ${typography.monospace};
    color: ${colors.textSecondary};
  }
`;

export const PageMessage = styled(Message)`
  margin-bottom: ${spacing.lg + 2}px;
`;

export const SearchHint = styled.div`
  margin: -4px 0 ${spacing.lg + 2}px;
  font-size: ${typography.sizes.sm + 0.5}px;
  color: ${colors.textDim};
`;

export const EmptyState = styled.div`
  padding: 44px ${spacing.xxl}px;
  border-radius: ${radii.xxl - 4}px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
  font-size: ${typography.sizes.md + 1}px;
  color: ${colors.textMuted};
`;
