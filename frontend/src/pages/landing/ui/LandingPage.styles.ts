import styled from "styled-components";

import { colors, spacing, typography } from "@/shared/styles/tokens";

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
  flex-wrap: wrap;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 320px);
  justify-content: center;
  gap: ${spacing.xxxl}px;
  margin-top: 30px;
`;

export const BottomText = styled.h2`
  text-align: center;
  margin-top: 80px;
  font-size: ${typography.sizes.h2 + 8}px;
  font-weight: ${typography.weights.regular};
  color: ${colors.textSecondary};
  letter-spacing: 0.3px;
`;
