import styled from "styled-components";

import { colors, radii, spacing, transitions, typography } from "@/shared/styles/tokens";

export const DatasetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl}px;
`;

export const DatasetPair = styled.div`
  padding: ${spacing.xl}px;
  border-radius: ${radii.xl}px;
  background: ${colors.surfaceSoft};
  border: 1px solid ${colors.border};
`;

export const PairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
`;

export const PairTitle = styled.div`
  font-weight: ${typography.weights.semibold};
`;

export const PairReady = styled.div`
  color: ${colors.success};
  font-size: ${typography.sizes.md}px;
`;

export const UploadGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg}px;
`;

export const UploadArea = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 180px;
  border-radius: ${radii.xl}px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: ${transitions.base};

  &:hover {
    border-color: ${colors.primaryBorder};
    background: ${colors.primarySoft};
  }
`;

export const UploadTitle = styled.div`
  font-weight: ${typography.weights.semibold};
  margin-bottom: ${spacing.sm}px;
`;

export const UploadHint = styled.div`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.textDim};
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: ${radii.xl}px;
`;

export const HiddenInput = styled.input`
  display: none;
`;
