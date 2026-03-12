/**
 * SaaS Dashboard Theme - Signature Clean Design
 * Professional blue color palette with clean, modern aesthetics
 */

export const saasTheme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
    },
    accent: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      tertiary: '#DBEAFE',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#94A3B8',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    success: 'linear-gradient(135deg, #10B981, #34D399)',
    warning: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    error: 'linear-gradient(135deg, #EF4444, #F87171)',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

export type SaaSTheme = typeof saasTheme;
