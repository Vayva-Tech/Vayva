/**
 * SaaS Dashboard Theme Presets
 * 5 color variants for customization
 */

export const themePresets = {
  'professional-blue': {
    name: 'Professional Blue',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    accent: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  },
  'tech-purple': {
    name: 'Tech Purple',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    background: '#FFFFFF',
    surface: '#F5F3FF',
    accent: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  },
  'growth-green': {
    name: 'Growth Green',
    primary: '#10B981',
    secondary: '#34D399',
    background: '#FFFFFF',
    surface: '#ECFDF5',
    accent: 'linear-gradient(135deg, #10B981, #34D399)',
  },
  'enterprise-slate': {
    name: 'Enterprise Slate',
    primary: '#64748B',
    secondary: '#94A3B8',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    accent: 'linear-gradient(135deg, #64748B, #94A3B8)',
  },
  'innovation-orange': {
    name: 'Innovation Orange',
    primary: '#F97316',
    secondary: '#FB923C',
    background: '#FFFFFF',
    surface: '#FFF7ED',
    accent: 'linear-gradient(135deg, #F97316, #FB923C)',
  },
};

export type ThemePresetKey = keyof typeof themePresets;
export type ThemePreset = typeof themePresets[ThemePresetKey];
