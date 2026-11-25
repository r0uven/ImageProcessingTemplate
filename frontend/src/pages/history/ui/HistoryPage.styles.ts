import styled from "styled-components";

import { Select } from "@/shared/ui/field";
import { Input } from "@/shared/ui/field";
import {
  colors,
  radii,
  spacing,
  typography,
} from "@/shared/styles/tokens";

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl}px;
  margin-bottom: ${spacing.xxxl}px;
  width: 100%;
  flex-wrap: wrap;
`;

export const SearchWrapper = styled.div`
  flex: 1;
  min-width: 220px;
`;

export const SearchInput = styled(Input)`
  height: 52px;
  padding: 0 ${spacing.xl}px;
  border-radius: ${radii.xl}px;
  font-size: ${typography.sizes.md + 1}px;
`;

export const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg}px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

export const SortSelect = styled(Select)`
  width: auto;
  min-width: 200px;
  height: 48px;
`;

export const EmptyState = styled.div`
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${radii.xxl}px;
  background: ${colors.surfaceSoft};
  border: 1px dashed ${colors.borderFaint};
`;

export const EmptyText = styled.div`
  font-size: ${typography.sizes.h3}px;
  color: ${colors.textDim};
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;
