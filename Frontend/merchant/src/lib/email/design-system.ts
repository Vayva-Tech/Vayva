export const Colors = {
  Brand: {
    Primary: "#22C55E", // Vayva Green
    Dark: "#064E3B", // Dark Green
    Light: "#DCFCE7", // Light Green Background
  },
  Neutral: {
    Black: "#111827", // Ink Black
    DarkGrey: "#374151",
    Grey: "#6B7280",
    LightGrey: "#E5E7EB",
    White: "#FFFFFF",
    Background: "#F3F4F6", // Page Background
  },
  State: {
    Error: "#EF4444",
    Warning: "#F59E0B",
    Success: "#10B981",
    Info: "#3B82F6",
  },
  Gradients: {
    Primary: "linear-gradient(135deg, #22C55E 0%, #16A34A 60%, #064E3B 100%)",
    Subtle: "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
    DarkOverlay:
      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%)",
  },
};
export const Typography = {
  FontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  Sizes: {
    H1: "24px",
    H2: "20px",
    H3: "18px",
    Body: "16px",
    Small: "14px",
    Micro: "12px",
  },
  LineHeights: {
    Relaxed: "1.6",
    Tight: "1.25",
  },
  Weights: {
    Regular: "400",
    Medium: "500",
    Bold: "600",
    Heavy: "700",
  },
};
export const Spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "40px",
};
export const Borders = {
  Radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  },
  Stroke: {
    Subtle: `1px solid ${Colors.Neutral.LightGrey}`,
  },
};
export const Shadows = {
  Card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  Button: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};
