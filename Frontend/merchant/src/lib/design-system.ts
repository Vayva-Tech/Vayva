/**
 * Design System Utilities
 * Standardized spacing, colors, and design tokens
 */

/* ------------------------------------------------------------------ */
/*  Spacing Scale (based on Tailwind's scale)                           */
/* ------------------------------------------------------------------ */
export const SPACING = {
  // Base unit: 4px = 0.25rem
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export type SpacingKey = keyof typeof SPACING;

/* ------------------------------------------------------------------ */
/*  Common Spacing Patterns                                             */
/* ------------------------------------------------------------------ */
export const SPACING_PATTERNS = {
  // Card padding
  CARD_PADDING_MOBILE: '4',
  CARD_PADDING_TABLET: '5',
  CARD_PADDING_DESKTOP: '6',
  
  // Section gaps
  SECTION_GAP_MOBILE: '6',
  SECTION_GAP_TABLET: '8',
  SECTION_GAP_DESKTOP: '12',
  
  // Element gaps
  ELEMENT_GAP_TIGHT: '2',
  ELEMENT_GAP_DEFAULT: '4',
  ELEMENT_GAP_LOOSE: '6',
  
  // Page padding
  PAGE_PADDING_MOBILE: '4',
  PAGE_PADDING_TABLET: '6',
  PAGE_PADDING_DESKTOP: '8',
} as const;

/* ------------------------------------------------------------------ */
/*  Color Palette (Industry Agnostic)                                   */
/* ------------------------------------------------------------------ */
export const COLORS = {
  // Primary brand colors
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Default primary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Basic colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

/* ------------------------------------------------------------------ */
/*  Industry-Specific Color Schemes                                     */
/* ------------------------------------------------------------------ */
export const INDUSTRY_COLORS = {
  retail: {
    primary: COLORS.primary[500],
    secondary: COLORS.info[500],
    accent: COLORS.warning[500],
  },
  restaurant: {
    primary: '#ef4444', // Red
    secondary: '#f97316', // Orange
    accent: '#eab308', // Yellow
  },
  healthcare: {
    primary: '#3b82f6', // Blue
    secondary: '#06b6d4', // Cyan
    accent: '#14b8a6', // Teal
  },
  beauty: {
    primary: '#ec4899', // Pink
    secondary: '#a855f7', // Purple
    accent: '#f472b6', // Light pink
  },
  automotive: {
    primary: '#1f2937', // Dark gray
    secondary: '#dc2626', // Red
    accent: '#f59e0b', // Amber
  },
  legal: {
    primary: '#1e40af', // Navy
    secondary: '#7c3aed', // Violet
    accent: '#059669', // Emerald
  },
  realEstate: {
    primary: '#059669', // Emerald
    secondary: '#0891b2', // Cyan
    accent: '#f59e0b', // Amber
  },
  education: {
    primary: '#7c3aed', // Violet
    secondary: '#2563eb', // Blue
    accent: '#f59e0b', // Amber
  },
  wellness: {
    primary: '#10b981', // Emerald
    secondary: '#14b8a6', // Teal
    accent: '#84cc16', // Lime
  },
  nightlife: {
    primary: '#a855f7', // Purple
    secondary: '#ec4899', // Pink
    accent: '#f43f5e', // Rose
  },
} as const;

export type IndustrySlug = keyof typeof INDUSTRY_COLORS;

/* ------------------------------------------------------------------ */
/*  Typography Scale                                                    */
/* ------------------------------------------------------------------ */
export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 28px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Border Radius                                                       */
/* ------------------------------------------------------------------ */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

/* ------------------------------------------------------------------ */
/*  Shadow Tokens                                                       */
/* ------------------------------------------------------------------ */
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/* ------------------------------------------------------------------ */
/*  Breakpoints                                                         */
/* ------------------------------------------------------------------ */
export const BREAKPOINTS = {
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2XLarge devices (extra large desktops)
} as const;

/* ------------------------------------------------------------------ */
/*  Z-Index Scale                                                       */
/* ------------------------------------------------------------------ */
export const Z_INDEX = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  modalBackdrop: '1300',
  modal: '1400',
  popover: '1500',
  tooltip: '1600',
} as const;

/* ------------------------------------------------------------------ */
/*  Icon Standardization                                                */
/* ------------------------------------------------------------------ */
export const ICON_LIBRARY = {
  // Preferred icon library for different categories
  NAVIGATION: 'phosphor',
  ACTIONS: 'phosphor',
  STATUS: 'phosphor',
  INDUSTRY: 'phosphor',
  FILE_TYPES: 'phosphor',
} as const;

export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/* ------------------------------------------------------------------ */
/*  Component Size Variants                                             */
/* ------------------------------------------------------------------ */
export const COMPONENT_SIZES = {
  button: {
    xs: { height: '6', paddingX: '2', fontSize: 'xs' },
    sm: { height: '8', paddingX: '3', fontSize: 'sm' },
    md: { height: '10', paddingX: '4', fontSize: 'base' },
    lg: { height: '12', paddingX: '5', fontSize: 'lg' },
    xl: { height: '14', paddingX: '6', fontSize: 'xl' },
  },
  input: {
    sm: { height: '8', paddingX: '3', fontSize: 'sm' },
    md: { height: '10', paddingX: '4', fontSize: 'base' },
    lg: { height: '12', paddingX: '5', fontSize: 'lg' },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Animation Durations                                                 */
/* ------------------------------------------------------------------ */
export const ANIMATION = {
  duration: {
    instant: '75ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '1000ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Export Complete Design System                                       */
/* ------------------------------------------------------------------ */
export const DESIGN_SYSTEM = {
  SPACING,
  SPACING_PATTERNS,
  COLORS,
  INDUSTRY_COLORS,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  BREAKPOINTS,
  Z_INDEX,
  ICON_LIBRARY,
  ICON_SIZES,
  COMPONENT_SIZES,
  ANIMATION,
} as const;

export default DESIGN_SYSTEM;
