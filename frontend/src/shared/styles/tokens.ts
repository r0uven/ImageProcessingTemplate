export const colors = {
  background: "#0b0f14",
  backgroundElevated: "#11161d",
  surface: "rgba(255, 255, 255, 0.04)",
  surfaceFaint: "rgba(255, 255, 255, 0.02)",
  surfaceSoft: "rgba(255, 255, 255, 0.03)",
  surfaceStrong: "rgba(255, 255, 255, 0.06)",
  surfaceHover: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.06)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  borderFaint: "rgba(255, 255, 255, 0.08)",
  text: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.82)",
  textMuted: "rgba(255, 255, 255, 0.62)",
  textDim: "rgba(255, 255, 255, 0.45)",
  textFaint: "rgba(255, 255, 255, 0.3)",
  primary: "#3a7afe",
  primaryHover: "#4b88ff",
  primaryActive: "#2f6ae0",
  primarySoft: "rgba(58, 122, 254, 0.14)",
  primaryBorder: "rgba(58, 122, 254, 0.45)",
  primaryText: "#9cc0ff",
  danger: "#ff5d5d",
  dangerHover: "#ff7070",
  dangerSoft: "rgba(255, 93, 93, 0.1)",
  dangerBorder: "rgba(255, 93, 93, 0.3)",
  dangerText: "#ffb4b4",
  success: "#45d483",
  successHover: "#57d98d",
  successSoft: "rgba(69, 212, 131, 0.12)",
  successBorder: "rgba(69, 212, 131, 0.28)",
  successText: "#8fe3b6",
  warning: "#f0b35b",
  warningSoft: "rgba(255, 190, 80, 0.12)",
  warningBorder: "rgba(255, 190, 80, 0.4)",
  warningText: "#ffd28a",
  overlay: "rgba(4, 7, 10, 0.72)",
  inputBackground: "rgba(0, 0, 0, 0.28)",
  inputBackgroundSoft: "rgba(0, 0, 0, 0.22)",
};

export const gradients = {
  page: `radial-gradient(
      circle at top left,
      rgba(58, 123, 213, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0, 210, 255, 0.12),
      transparent 30%
    ),
    ${colors.background}`,
};

export const radii = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  massive: 72,
};

export const typography = {
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  monospace: '"Cascadia Code", "Consolas", monospace',
  sizes: {
    xs: 11,
    sm: 12.5,
    md: 14,
    lg: 16,
    xl: 18,
    h3: 20,
    h2: 22,
    h1: 40,
    hero: 42,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.5,
  },
};

export const shadows = {
  card: "0 18px 40px rgba(0, 0, 0, 0.28)",
  sticky: "0 18px 40px rgba(0, 0, 0, 0.3)",
  dialog: "0 24px 80px rgba(0, 0, 0, 0.55)",
  floating: "0 8px 30px rgba(0, 0, 0, 0.35)",
};

export const transitions = {
  fast: "0.15s ease",
  base: "0.2s ease",
};

export const zIndex = {
  toolbar: 20,
  actionBar: 50,
  backButton: 1000,
  dialog: 1100,
};

export const breakpoints = {
  sm: "640px",
  md: "720px",
  lg: "1024px",
};

export const theme = {
  colors,
  gradients,
  radii,
  spacing,
  typography,
  shadows,
  transitions,
  zIndex,
  breakpoints,
};

export type AppTheme = typeof theme;
