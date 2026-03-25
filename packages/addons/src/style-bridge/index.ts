/**
 * Style Bridge - CSS Isolation and Theme Synchronization
 * 
 * Handles:
 * - CSS variable injection from host to sandboxed add-ons
 * - Theme synchronization (light/dark mode - disabled per user preference)
 * - Style isolation between add-ons and host
 * - Container query support for responsive add-on layouts
 */

import type { CSSProperties } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ThemeTokens {
  // Brand colors
  primary: string;
  secondary: string;
  accent: string;
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  // Background colors
  background: string;
  surface: string;
  elevated: string;
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  // Border and shadow
  border: string;
  borderLight: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  // Spacing (in rem)
  space1: string;
  space2: string;
  space3: string;
  space4: string;
  space6: string;
  space8: string;
  // Typography
  fontSans: string;
  fontMono: string;
  textXs: string;
  textSm: string;
  textBase: string;
  textLg: string;
  textXl: string;
  text2xl: string;
  // Border radius
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusFull: string;
}

export interface StyleBridgeConfig {
  /** CSS selector for the add-on container */
  containerSelector: string;
  /** Whether to enable CSS isolation */
  isolateStyles: boolean;
  /** Custom CSS variables to inject */
  customVariables?: Record<string, string>;
  /** Container breakpoints for responsive design */
  containerBreakpoints?: ContainerBreakpoints;
}

export interface ContainerBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ComputedStyles {
  variables: Record<string, string>;
  inlineStyles: CSSProperties;
}

// ============================================================================
// Default Vayva Theme (Light mode - dark mode disabled per user preference)
// ============================================================================

export const VAYVA_DEFAULT_TOKENS: ThemeTokens = {
  // Brand colors - Vayva green
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',
  elevated: '#FFFFFF',
  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  // Border and shadow
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  // Spacing (rem units)
  space1: '0.25rem',
  space2: '0.5rem',
  space3: '0.75rem',
  space4: '1rem',
  space6: '1.5rem',
  space8: '2rem',
  // Typography
  fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  textXs: '0.75rem',
  textSm: '0.875rem',
  textBase: '1rem',
  textLg: '1.125rem',
  textXl: '1.25rem',
  text2xl: '1.5rem',
  // Border radius
  radiusSm: '0.25rem',
  radiusMd: '0.375rem',
  radiusLg: '0.5rem',
  radiusFull: '9999px',
};

export const DEFAULT_BREAKPOINTS: ContainerBreakpoints = {
  sm: '320px',
  md: '640px',
  lg: '1024px',
  xl: '1280px',
};

// ============================================================================
// Style Bridge Class
// ============================================================================

export class StyleBridge {
  private config: StyleBridgeConfig;
  private tokens: ThemeTokens;
  private styleElement: HTMLStyleElement | null = null;

  constructor(
    config: Partial<StyleBridgeConfig> = {},
    tokens: Partial<ThemeTokens> = {}
  ) {
    this.config = {
      containerSelector: '.vayva-addon-container',
      isolateStyles: true,
      containerBreakpoints: DEFAULT_BREAKPOINTS,
      ...config,
    };
    this.tokens = { ...VAYVA_DEFAULT_TOKENS, ...tokens };
  }

  /**
   * Generate CSS custom properties from tokens
   */
  generateCSSVariables(): string {
    const vars = Object.entries(this.tokens)
      .map(([key, value]) => {
        const cssVar = this.camelToKebab(key);
        return `  --vayva-${cssVar}: ${value};`;
      })
      .join('\n');

    return `:root {\n${vars}\n}`;
  }

  /**
   * Generate container query styles for responsive add-ons
   */
  generateContainerStyles(): string {
    const { sm, md, lg, xl } = this.config.containerBreakpoints || DEFAULT_BREAKPOINTS;

    return `
${this.config.containerSelector} {
  container-type: inline-size;
  container-name: addon;
}

@container addon (min-width: ${sm}) {
  .addon-responsive { --container: sm; }
}

@container addon (min-width: ${md}) {
  .addon-responsive { --container: md; }
}

@container addon (min-width: ${lg}) {
  .addon-responsive { --container: lg; }
}

@container addon (min-width: ${xl}) {
  .addon-responsive { --container: xl; }
}
`;
  }

  /**
   * Generate isolation styles to prevent add-on CSS from leaking
   */
  generateIsolationStyles(): string {
    if (!this.config.isolateStyles) return '';

    return `
${this.config.containerSelector} {
  /* CSS containment for performance */
  contain: layout style paint;
  
  /* Create new stacking context */
  isolation: isolate;
  
  /* Prevent inheritance of certain properties */
  font-size: var(--vayva-text-base);
  font-family: var(--vayva-font-sans);
  color: var(--vayva-text-primary);
  line-height: 1.5;
}

/* Reset common problematic inherited styles */
${this.config.containerSelector} * {
  box-sizing: border-box;
}

/* Scoped reset for add-on content */
${this.config.containerSelector} h1,
${this.config.containerSelector} h2,
${this.config.containerSelector} h3,
${this.config.containerSelector} h4,
${this.config.containerSelector} h5,
${this.config.containerSelector} h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.25;
}

${this.config.containerSelector} p {
  margin: 0;
}

${this.config.containerSelector} a {
  color: var(--vayva-primary);
  text-decoration: none;
}

${this.config.containerSelector} button {
  font-family: inherit;
}
`;
  }

  /**
   * Generate complete stylesheet for injection
   */
  generateStylesheet(): string {
    return [
      this.generateCSSVariables(),
      this.generateContainerStyles(),
      this.generateIsolationStyles(),
      this.generateCustomVariables(),
    ].join('\n\n');
  }

  /**
   * Inject styles into the document
   */
  inject(hostDocument: Document = document): void {
    // Remove existing style element if present
    this.remove(hostDocument);

    // Create and inject new style element
    this.styleElement = hostDocument.createElement('style');
    this.styleElement.id = 'vayva-style-bridge';
    this.styleElement.textContent = this.generateStylesheet();
    hostDocument.head.appendChild(this.styleElement);
  }

  /**
   * Remove injected styles
   */
  remove(hostDocument: Document = document): void {
    const existing = hostDocument.getElementById('vayva-style-bridge');
    if (existing) {
      existing.remove();
    }
    this.styleElement = null;
  }

  /**
   * Update tokens and regenerate styles
   */
  updateTokens(tokens: Partial<ThemeTokens>): void {
    this.tokens = { ...this.tokens, ...tokens };
    if (this.styleElement) {
      this.styleElement.textContent = this.generateStylesheet();
    }
  }

  /**
   * Get computed CSS properties as React inline styles
   */
  getInlineStyles(): CSSProperties {
    return {
      fontFamily: this.tokens.fontSans,
      fontSize: this.tokens.textBase,
      color: this.tokens.textPrimary,
      backgroundColor: this.tokens.background,
    };
  }

  /**
   * Get CSS custom properties as a record for dynamic injection
   */
  getCSSVariablesRecord(): Record<string, string> {
    return Object.entries(this.tokens).reduce((acc, [key, value]) => {
      acc[`--vayva-${this.camelToKebab(key)}`] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Generate custom variables from config
   */
  private generateCustomVariables(): string {
    if (!this.config.customVariables) return '';

    const vars = Object.entries(this.config.customVariables)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    return `:root {\n${vars}\n}`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a StyleBridge instance with Vayva defaults
 */
export function createStyleBridge(
  config?: Partial<StyleBridgeConfig>,
  tokens?: Partial<ThemeTokens>
): StyleBridge {
  return new StyleBridge(config, tokens);
}

/**
 * Extract computed theme tokens from an element
 */
export function extractThemeFromElement(element: HTMLElement): Partial<ThemeTokens> {
  const computed = getComputedStyle(element);
  
  return {
    primary: computed.getPropertyValue('--vayva-primary').trim() || VAYVA_DEFAULT_TOKENS.primary,
    background: computed.getPropertyValue('--vayva-background').trim() || VAYVA_DEFAULT_TOKENS.background,
    textPrimary: computed.getPropertyValue('--vayva-text-primary').trim() || VAYVA_DEFAULT_TOKENS.textPrimary,
    // Add more as needed
  };
}

/**
 * Apply CSS variables to a specific element
 */
export function applyThemeToElement(
  element: HTMLElement,
  tokens: Partial<ThemeTokens>
): void {
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) {
      element.style.setProperty(`--vayva-${key.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`, value);
    }
  });
}

export default StyleBridge;
