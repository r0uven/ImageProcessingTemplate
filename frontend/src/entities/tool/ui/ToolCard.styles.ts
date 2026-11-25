import styled from "styled-components";
import { motion } from "framer-motion";

import { IconButton } from "@/shared/ui/button";
import { colors, radii, spacing, transitions, typography } from "@/shared/styles/tokens";
import CrossSVG from "@/shared/assets/CrossSVG.svg?react";

export const Card = styled(motion.div)`
  position: relative;
  height: 340px;
  border-radius: ${radii.xl}px;
  overflow: hidden;
  cursor: pointer;
  background: ${colors.backgroundElevated};
  border: 1px solid ${colors.borderStrong};
`;

export const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 14px;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  justify-content: space-around;
  gap: ${spacing.md}px;
  color: ${colors.text};
  font-size: ${typography.sizes.h3}px;
`;

export const DeleteButton = styled(IconButton).attrs({
  $variant: "danger",
})`
  position: absolute;
  top: 14px;
  right: 14px;
  backdrop-filter: blur(10px);
`;

export const StyledDeleteSVG = styled(CrossSVG)`
  width: 16px;
  height: 16px;
  color: currentColor;
`;

export const PlusContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 110px;
  color: rgba(255, 255, 255, 0.2);
  transition:
    color ${transitions.base},
    transform ${transitions.base};

  ${Card}:hover & {
    color: rgba(255, 255, 255, 0.35);
    transform: scale(1.05);
  }
`;
