import styled from "styled-components";

export const Card = styled.section`
  padding: 20px 24px;

  border-radius: 22px;

  background: rgba(255, 255, 255, 0.035);

  border: 1px solid rgba(255, 255, 255, 0.06);

  margin-bottom: 24px;
`;

export const TopRow = styled.div`
  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 4px;

  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;

  font-size: 16px;

  font-weight: 650;

  letter-spacing: -0.2px;
`;

export const Subtitle = styled.div`
  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;

export const OpenLink = styled.a`
  padding: 7px 11px;

  border-radius: 10px;

  border: 1px solid rgba(58, 122, 254, 0.25);

  background: rgba(58, 122, 254, 0.1);

  color: #9cc0ff;

  font-size: 12px;

  font-weight: 600;

  text-decoration: none;

  transition: 0.2s ease;

  &:hover {
    background: rgba(58, 122, 254, 0.2);

    border-color: rgba(58, 122, 254, 0.45);

    color: white;
  }
`;

export const OpenLinkDisabled = styled.span`
  padding: 7px 11px;

  border-radius: 10px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.035);

  color: rgba(255, 255, 255, 0.38);

  font-size: 12px;

  font-weight: 600;

  cursor: not-allowed;

  user-select: none;
`;

export const Viewer = styled.div`
  display: flex;

  align-items: center;

  justify-content: center;

  min-height: 220px;

  margin-top: 16px;

  padding: 12px;

  border-radius: 18px;

  border: 1px solid rgba(255, 255, 255, 0.07);

  background: rgba(0, 0, 0, 0.25);
`;

export const ViewerLink = styled.a`
  display: flex;

  align-items: center;

  justify-content: center;

  width: 100%;
`;

export const Preview = styled.img`
  display: block;

  max-width: 100%;

  max-height: 520px;

  object-fit: contain;

  border-radius: 10px;
`;

export const Thumbnails = styled.div`
  display: flex;

  gap: 10px;

  margin-top: 14px;

  flex-wrap: wrap;
`;

export const ThumbButton = styled.button<{ $active: boolean }>`
  display: flex;

  flex-direction: column;

  gap: 6px;

  width: 124px;

  padding: 7px;

  border-radius: 12px;

  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(58, 122, 254, 0.6)" : "rgba(255, 255, 255, 0.08)"};

  background: ${({ $active }) =>
    $active ? "rgba(58, 122, 254, 0.14)" : "rgba(255, 255, 255, 0.03)"};

  color: ${({ $active }) =>
    $active ? "white" : "rgba(255, 255, 255, 0.65)"};

  font-size: 11.5px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

  &:hover {
    border-color: rgba(58, 122, 254, 0.45);

    background: rgba(58, 122, 254, 0.1);

    color: white;
  }

  &:focus-visible {
    outline: 2px solid rgba(58, 122, 254, 0.8);

    outline-offset: 2px;
  }
`;

export const ThumbImage = styled.img`
  display: block;

  width: 100%;

  height: 64px;

  object-fit: contain;

  border-radius: 8px;

  background: rgba(0, 0, 0, 0.3);
`;

export const ThumbLabel = styled.span`
  text-align: center;

  overflow-wrap: anywhere;
`;

export const Note = styled.div`
  margin-top: 12px;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;
