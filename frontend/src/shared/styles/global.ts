import { createGlobalStyle } from "styled-components";

import {
  colors,
  typography,
} from "./tokens";

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    overflow: auto;
    background: ${colors.background};
    color: ${colors.text};
    font-family: ${typography.fontFamily};
    font-size: ${typography.sizes.md}px;
    line-height: ${typography.lineHeights.normal};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  img {
    max-width: 100%;
  }

  ::selection {
    background: ${colors.primarySoft};
    color: ${colors.text};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.16);
  }
`;
