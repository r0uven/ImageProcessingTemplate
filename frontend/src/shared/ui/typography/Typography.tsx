import styled from "styled-components";

import {
  cardTitleText,
  hintText,
  pageSubtitleText,
  pageTitleText,
} from "@/shared/styles/mixins";
import { colors, spacing, typography } from "@/shared/styles/tokens";

export const PageTitle = styled.h1`
  ${pageTitleText};
`;

export const PageSubtitle = styled.div`
  ${pageSubtitleText};
`;

export const CardTitle = styled.h2`
  ${cardTitleText};
  margin-bottom: ${spacing.lg}px;
`;

export const CardSubtitle = styled.div`
  ${hintText};
`;

export const Hint = styled.div`
  ${hintText};
`;

export const MutedText = styled.span`
  color: ${colors.textMuted};
  font-size: ${typography.sizes.md}px;
`;
