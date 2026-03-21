'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  getDesignCategoryForIndustry, 
  getDefaultPresetForCategory 
} from '@/config/industry-design-categories';

export type DesignCategory = 'signature' | 'glass' | 'bold' | 'dark' | 'natural';
export type ThemePreset = 'default' | 'rose-gold' | 'ocean-breeze' | 'forest-mist' | 'midnight-luxe' | 'sunset-vibes' | 'creative-purple' | 'innovation-blue' | 'energy-orange';

interface ThemeContextType {
  designCategory: DesignCategory;
  themePreset: ThemePreset;
  setDesignCategory: (category: DesignCategory) => void;
  setThemePreset: (preset: ThemePreset) => void;
  customColors: Record<string, string>;
  setCustomColors: (colors: Record<string, string>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultCategory?: DesignCategory;
  defaultPreset?: ThemePreset;
  industrySlug?: string; // Auto-set theme based on industry
}

/**
 * VayvaThemeProvider - Manages industry themes and design categories
 */
export const VayvaThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultCategory = 'signature',
  defaultPreset = 'default',
  industrySlug,
}) => {
  const [designCategory, setDesignCategory] = useState<DesignCategory>(() => {
    // Priority: 1. Industry default, 2. Saved preference, 3. Prop default
    if (industrySlug) {
      const industryCategory = getDesignCategoryForIndustry(industrySlug);
      return industryCategory;
    }
    
    const savedCategory = localStorage.getItem('vayva-design-category') as DesignCategory;
    return savedCategory || defaultCategory;
  });
  
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    const savedPreset = localStorage.getItem('vayva-theme-preset') as ThemePreset;
    return savedPreset || defaultPreset;
  });
  
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true);
    const savedCategory = localStorage.getItem('vayva-design-category') as DesignCategory;
    const savedPreset = localStorage.getItem('vayva-theme-preset') as ThemePreset;
    
    if (savedCategory) setDesignCategory(savedCategory);
    if (savedPreset) setThemePreset(savedPreset);
  }, []);

  // Save preferences when changed
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('vayva-design-category', designCategory);
    localStorage.setItem('vayva-theme-preset', themePreset);
    
    // Apply CSS variables
    applyTheme(designCategory, themePreset, customColors);
  }, [designCategory, themePreset, customColors, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        designCategory,
        themePreset,
        setDesignCategory,
        setThemePreset,
        customColors,
        setCustomColors,
      }}
    >
      <div
        className={cn(
          'min-h-screen transition-colors duration-300 bg-gray-50'
        )}
        data-design-category={designCategory}
        data-theme-preset={themePreset}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useVayvaTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useVayvaTheme must be used within a VayvaThemeProvider');
  }
  return context;
};

/**
 * Apply theme CSS variables
 */
function applyTheme(
  category: DesignCategory,
  preset: ThemePreset,
  customColors: Record<string, string>
) {
  const root = document.documentElement;
  const colors = getThemeColors(category, preset);
  
  // Merge with custom colors
  const mergedColors = { ...colors, ...customColors };
  
  // Apply all CSS variables
  Object.entries(mergedColors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

/**
 * Get theme colors based on category and preset
 * NEUTRALIZED: All categories now use identical white/gray styling
 */
function getThemeColors(category: DesignCategory, preset: ThemePreset): Record<string, string> {
  // Unified styling for ALL categories and presets - no variation
  return {
    'gradient-primary': 'none',
    'gradient-secondary': 'none',
    'background-base': '#F9FAFB',
    'card-bg': '#FFFFFF',
    'card-border': '#E5E7EB',
    'text-green-500': '#1F2937',
    'text-secondary': '#6B7280',
    'accent-glow': 'none',
  };
}

/**
 * Get background class for design category
 */
function getBackgroundClass(category: DesignCategory): string {
  switch (category) {
    case 'glass':
      return 'bg-gradient-to-br from-green-50 via-purple-50 to-pink-50';
    case 'bold':
      return 'bg-white';
    case 'dark':
      return 'bg-gray-900';
    case 'natural':
      return 'bg-orange-50';
    case 'signature':
    default:
      return 'bg-gray-50';
  }
}
