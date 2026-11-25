import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(58, 123, 213, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0, 210, 255, 0.12),
      transparent 30%
    ),
    #0b0f14;

  color: white;
`;

export const Content = styled.div`
  max-width: 1200px;

  width: 100%;

  box-sizing: border-box;

  margin: 0 auto;

  padding: 72px 48px 140px;
`;

export const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 24px;

  margin-bottom: 32px;

  flex-wrap: wrap;
`;

export const TitleBlock = styled.div`
  display: flex;

  flex-direction: column;

  gap: 10px;
`;

export const Title = styled.h1`
  margin: 0;

  font-size: 40px;

  font-weight: 700;

  letter-spacing: -1px;
`;

export const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.6);

  font-size: 16px;

  max-width: 720px;

  line-height: 1.5;
`;

export const ActionBar = styled.div`
  position: fixed;

  left: 0;
  right: 0;
  bottom: 0;

  z-index: 50;

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 12px;

  flex-wrap: wrap;

  padding: 14px 24px;

  background: rgba(11, 15, 20, 0.9);

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(16px);

  box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.3);
`;

export const ActionBarStatus = styled.div<{
  $dirty?: boolean;
  $error?: boolean;
}>`
  display: flex;

  align-items: center;

  gap: 8px;

  margin-right: auto;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.55);

  &::before {
    content: "";

    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: ${({ $dirty, $error }) =>
      $error ? "#ff5d5d" : $dirty ? "#f0b35b" : "rgba(74, 222, 128, 0.85)"};
  }
`;


export const MetaCard = styled.div`
  padding: 18px 22px;

  border-radius: 18px;

  border: 1px solid rgba(255, 255, 255, 0.07);

  background: rgba(255, 255, 255, 0.03);

  display: flex;

  flex-direction: column;

  gap: 8px;

  margin-bottom: 18px;
`;

export const MetaRow = styled.div`
  display: flex;

  gap: 10px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.62);

  flex-wrap: wrap;

  word-break: break-all;

  strong {
    color: rgba(255, 255, 255, 0.85);

    font-weight: 600;
  }

  code {
    font-family: "Cascadia Code", "Consolas", monospace;

    color: rgba(255, 255, 255, 0.82);
  }
`;

export const Message = styled.div<{ $error?: boolean }>`
  padding: 14px 18px;

  border-radius: 14px;

  margin-bottom: 18px;

  font-size: 14px;

  white-space: pre-wrap;

  border: 1px solid
    ${({ $error }) =>
      $error ? "rgba(255, 93, 93, 0.35)" : "rgba(74, 222, 128, 0.3)"};

  background: ${({ $error }) =>
    $error ? "rgba(255, 93, 93, 0.1)" : "rgba(74, 222, 128, 0.1)"};

  color: ${({ $error }) => ($error ? "#ffb4b4" : "#b9f6ca")};
`;

export const SearchHint = styled.div`
  margin: -4px 0 18px;

  font-size: 13px;

  color: rgba(255, 255, 255, 0.48);
`;

export const EmptyState = styled.div`
  padding: 44px 24px;

  border-radius: 20px;

  border: 1px dashed rgba(255, 255, 255, 0.14);

  background: rgba(255, 255, 255, 0.02);

  text-align: center;

  font-size: 15px;

  color: rgba(255, 255, 255, 0.55);
`;

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 20px;

  border-radius: 14px;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  border: 1px solid
    ${({ $primary }) =>
      $primary ? "transparent" : "rgba(255, 255, 255, 0.12)"};

  background: ${({ $primary }) =>
    $primary ? "#3a7afe" : "rgba(255, 255, 255, 0.05)"};

  color: white;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);

    background: ${({ $primary }) =>
      $primary ? "#4b88ff" : "rgba(255, 255, 255, 0.09)"};
  }

  &:disabled {
    opacity: 0.45;

    cursor: not-allowed;
  }
`;
