/**
 * Home-e-Fix Design Tokens & Theme Constants
 * Source of truth for brand identity, colors, typography, spacing, and border radius.
 */

export const BRAND_IDENTITY = {
  name: "Home-e-Fix",
  tagline: "FIXING HOMES. EARNING TRUST.",
  concept: "HOME + e + FIX",
  description:
    "Your trusted partner for professional home services connecting customers with verified professionals.",
} as const;

export const BRAND_COLORS = {
  // Primary Palette
  navy: "#0B2341",
  navyLight: "#13335A",
  navyLighter: "#1E4678",
  navyDark: "#071525",

  // Accent Palette
  orange: "#FF6A00",
  orangeLight: "#FF8533",
  orangeLighter: "#FFA366",
  orangeDark: "#E05D00",

  // Supporting Neutrals
  white: "#FFFFFF",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  dark: "#071525",
  text: "#111827",
  muted: "#64748B",
  mutedLight: "#F1F5F9",
  border: "#E2E8F0",

  // Semantic
  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
} as const;

export const TYPOGRAPHY = {
  fontBody: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontHeading: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontDisplay: "Playfair Display, Georgia, serif",
  fontMono: "JetBrains Mono, monospace",
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

export const BORDER_RADIUS = {
  small: "8px", // radius-sm
  medium: "12px", // radius-md
  large: "16px", // radius-lg
  premium: "20px", // radius-xl
  premiumLarge: "24px", // radius-2xl
  full: "9999px",
} as const;

export const SPACING_SYSTEM = {
  base: 4, // 4px / 8px grid
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

export const LIQUID_GLASS = {
  standard: "liquid-glass",
  dark: "liquid-glass-dark",
  style: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
} as const;
