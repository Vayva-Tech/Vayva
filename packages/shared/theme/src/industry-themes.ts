/**
 * Industry-Specific Theme Presets
 * Pre-built themes for different industry verticals
 */

export interface ThemePreset {
  name: string;
  id: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
  };
  borderRadius: string;
  shadows: string;
}

// Wellness Theme Variations
export const wellnessThemes: Record<string, ThemePreset> = {
  'serene-garden': {
    name: 'Serene Garden',
    id: 'serene-garden',
    description: 'Default wellness theme with natural greens',
    colors: {
      primary: '#84A98C', // Serene Green
      secondary: '#D4B499', // Warm Sand
      accent: '#E8D5D5', // Soft Blush
      background: '#F8F9F5', // Mist White
      surface: 'rgba(255, 255, 255, 0.95)' // Off-white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  },
  
  'lavender-dreams': {
    name: 'Lavender Dreams',
    id: 'lavender-dreams',
    description: 'Calming lavender theme for relaxation',
    colors: {
      primary: '#B8A8D6', // Lavender
      secondary: '#D4B499', // Sand
      accent: '#E8D5E8', // Lilac
      background: '#F9F7FB', // Lavender Tint
      surface: 'rgba(249, 247, 251, 0.95)' // Lavender white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  },
  
  'ocean-breeze': {
    name: 'Ocean Breeze',
    id: 'ocean-breeze',
    description: 'Refreshing seafoam theme',
    colors: {
      primary: '#7FB3C9', // Seafoam
      secondary: '#D4B499', // Beach Sand
      accent: '#B8D8D8', // Aqua Mist
      background: '#F5FBFC', // Ocean Tint
      surface: 'rgba(245, 251, 252, 0.95)' // Aqua white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  },
  
  'sunset-terrace': {
    name: 'Sunset Terrace',
    id: 'sunset-terrace',
    description: 'Warm golden theme for evening ambiance',
    colors: {
      primary: '#D4A574', // Golden Sand
      secondary: '#E8B4B8', // Rose Gold
      accent: '#F4D35E', // Sunset Yellow
      background: '#FFFBF7', // Warm Glow
      surface: 'rgba(255, 251, 247, 0.95)' // Warm white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  },
  
  'forest-retreat': {
    name: 'Forest Retreat',
    id: 'forest-retreat',
    description: 'Deep forest green theme for grounding',
    colors: {
      primary: '#5A7C5E', // Forest Green
      secondary: '#8B7355', // Wood Brown
      accent: '#A8C6A0', // Sage
      background: '#F5F7F5', // Forest Mist
      surface: 'rgba(245, 247, 245, 0.95)' // Forest white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  }
};

export const industryThemes: Record<string, ThemePreset> = {
  travel: {
    name: 'Travel Explorer',
    id: 'travel',
    description: 'Modern travel and hospitality theme with vibrant colors',
    colors: {
      primary: '#2563eb', // Blue for trust and reliability
      secondary: '#0ea5e9', // Sky blue for adventure
      accent: '#f59e0b', // Amber for warmth
      background: '#f8fafc', // Light neutral
      surface: '#ffffff' // Clean white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'lg',
    shadows: 'lg'
  },

  hospitality: {
    name: 'Luxury Hospitality',
    id: 'hospitality',
    description: 'Elegant luxury theme with sophisticated colors',
    colors: {
      primary: '#d97706', // Amber for luxury
      secondary: '#b45309', // Deep amber
      accent: '#f59e0b', // Golden accent
      background: '#fdfdfc', // Warm ivory
      surface: '#ffffff' // Crisp white
    },
    typography: {
      fontFamily: "'Merriweather', serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'xl'
  },

  adventure: {
    name: 'Outdoor Adventure',
    id: 'adventure',
    description: 'Bold outdoor theme with nature-inspired colors',
    colors: {
      primary: '#16a34a', // Green for nature
      secondary: '#22c55e', // Emerald for vitality
      accent: '#eab308', // Yellow for energy
      background: '#f0fdf4', // Light green
      surface: '#ffffff' // Clean white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Anton', sans-serif"
    },
    borderRadius: 'md',
    shadows: 'md'
  },

  corporate: {
    name: 'Corporate Professional',
    id: 'corporate',
    description: 'Clean professional theme for business applications',
    colors: {
      primary: '#1f2937', // Dark gray for professionalism
      secondary: '#374151', // Medium gray
      accent: '#3b82f6', // Blue accent
      background: '#f9fafb', // Light gray
      surface: '#ffffff' // White
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Inter', sans-serif"
    },
    borderRadius: 'md',
    shadows: 'sm'
  },

  creative: {
    name: 'Creative Studio',
    id: 'creative',
    description: 'Vibrant creative theme with bold colors',
    colors: {
      primary: '#8b5cf6', // Purple for creativity
      secondary: '#a855f7', // Vibrant purple
      accent: '#ec4899', // Pink accent
      background: '#f5f3ff', // Light purple
      surface: '#ffffff' // White
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Bebas Neue', sans-serif"
    },
    borderRadius: 'full',
    shadows: 'lg'
  },

  wellness: {
    name: 'Natural Warmth',
    id: 'wellness',
    description: 'Serene wellness theme with organic, nature-inspired colors',
    colors: {
      primary: '#84A98C', // Serene Green
      secondary: '#D4B499', // Warm Sand
      accent: '#E8D5D5', // Soft Blush
      background: '#F8F9F5', // Mist White
      surface: '#ffffff' // Clean white
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      headingFont: "'Playfair Display', serif"
    },
    borderRadius: 'xl',
    shadows: 'lg'
  }
};

export const getThemeCSSVariables = (theme: ThemePreset): Record<string, string> => {
  return {
    '--primary': theme.colors.primary,
    '--primary-foreground': getContrastColor(theme.colors.primary),
    '--secondary': theme.colors.secondary,
    '--secondary-foreground': getContrastColor(theme.colors.secondary),
    '--accent': theme.colors.accent,
    '--accent-foreground': getContrastColor(theme.colors.accent),
    '--background': theme.colors.background,
    '--foreground': '#1f2937',
    '--card': theme.colors.surface,
    '--card-foreground': '#1f2937',
    '--popover': theme.colors.surface,
    '--popover-foreground': '#1f2937',
    '--muted': '#f3f4f6',
    '--muted-foreground': '#6b7280',
    '--border': '#e5e7eb',
    '--input': '#e5e7eb',
    '--ring': theme.colors.primary,
    '--radius': theme.borderRadius === 'full' ? '9999px' : 
               theme.borderRadius === 'xl' ? '1rem' :
               theme.borderRadius === 'lg' ? '0.75rem' :
               theme.borderRadius === 'md' ? '0.5rem' : '0.25rem'
  };
};

// Helper function to determine contrast color
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const applyTheme = (themeId: string): void => {
  // Check wellness themes first
  const theme = wellnessThemes[themeId] || industryThemes[themeId];
  if (!theme) return;
  
  const variables = getThemeCSSVariables(theme);
  
  // Apply CSS variables to root
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Apply font families
  document.documentElement.style.setProperty('--font-family-sans', theme.typography.fontFamily);
  document.documentElement.style.setProperty('--font-family-heading', theme.typography.headingFont);
  
  // Store current theme in localStorage
  localStorage.setItem('vayva-theme', themeId);
};

export const getCurrentTheme = (): string | null => {
  return localStorage.getItem('vayva-theme');
};

export const initializeTheme = (): void => {
  const savedTheme = getCurrentTheme();
  const defaultTheme = 'corporate'; // fallback
  
  applyTheme(savedTheme || defaultTheme);
};