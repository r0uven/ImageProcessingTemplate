import styled from "styled-components";
import CrossSVG from "@/assets/CrossSVG.svg?react";

import { motion } from "framer-motion";

export const Card = styled(motion.div)`
  position: relative;

  height: 340px;

  border-radius: 18px;

  overflow: hidden;

  cursor: pointer;

  background: #222;

  border: 1px solid #333;
`;

export const CardImage = styled.img`
  width: 100%;

  height: 100%;

  object-fit: cover;
`;

export const Overlay = styled.div`
  position: absolute;

  font-size: 20px;

  bottom: 0;

  width: 100%;

  padding: 14px;

  background: rgba(0, 0, 0, 0.72);

  display: flex;

  justify-content: space-around;

  color: white;

  box-sizing: border-box;
`;

export const DeleteButton = styled.button`
  position: absolute;
  padding: 5px;
  top: 14px;
  right: 14px;

  width: 38px;
  height: 38px;

  border: none;

  border-radius: 50%;

  background: rgba(0, 0, 0, 0.5);

  backdrop-filter: blur(10px);

  color: white;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(255, 70, 70, 0.8);

    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }
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
    color 0.2s ease,
    transform 0.2s ease;

  ${Card}:hover & {
    color: rgba(255, 255, 255, 0.35);

    transform: scale(1.05);
  }
`;
