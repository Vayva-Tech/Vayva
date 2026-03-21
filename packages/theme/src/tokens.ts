export const tokens = {
  colors: {
    primary: "#46EC13", // The Vayva Lime
    primaryHover: "#3DD10F",
    background: "#f0fdf4", // Light Green (Matched to crm-canvas start)
    surface: "#FFFFFF",
    text: {
      primary: "#1d1d1f", // Passes WCAG AAA on white backgrounds
      secondary: "#52525B", // Zinc-600 - passes WCAG AA 4.5:1 on white
      tertiary: "#71717A",  // Zinc-500 - passes WCAG AA 4.5:1 on white
      inverse: "#FFFFFF",
    },
    border: "#E5E7EB",
    error: "#EF4444",
    success: "#10B981",
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    10: "40px",
  },
  typography: {
    fontFamily: "Manrope, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
} as const;
