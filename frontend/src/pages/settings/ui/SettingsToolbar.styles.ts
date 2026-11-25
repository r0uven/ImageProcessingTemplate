import styled from "styled-components";

import { IconButton } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import {
  radii,
  shadows,
  spacing,
  typography,
  zIndex,
} from "@/shared/styles/tokens";

export const Toolbar = styled.div`
  position: sticky;
  top: 14px;
  z-index: ${zIndex.toolbar};
  margin-left: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
  flex-wrap: wrap;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.lg + 2}px;
  border-radius: ${radii.xl - 2}px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(11, 15, 20, 0.9);
  backdrop-filter: blur(14px);
  box-shadow: ${shadows.card};
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

export const SearchInput = styled(Input)`
  padding: 11px 42px 11px 14px;
  border-radius: ${radii.md}px;

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

export const ClearSearch = styled(IconButton)`
  position: absolute;
  top: 50%;
  right: ${spacing.sm}px;
  transform: translateY(-50%);
  font-size: ${typography.sizes.lg}px;
  line-height: 1;

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.96);
  }
`;

export const ToolbarActions = styled.div`
  display: flex;
  gap: ${spacing.sm}px;
  flex-wrap: wrap;
`;
