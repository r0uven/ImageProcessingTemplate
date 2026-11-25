import styled from "styled-components";

import { Card } from "@/shared/ui/card";
import { spacing } from "@/shared/styles/tokens";

export const FormCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl}px;
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: ${spacing.xxl}px;
`;

export const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxl}px;
  min-width: 0;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.lg}px;
`;
