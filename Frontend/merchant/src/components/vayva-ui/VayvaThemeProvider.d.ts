import React from 'react';
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
interface ThemeProviderProps {
    children: React.ReactNode;
    defaultCategory?: DesignCategory;
    defaultPreset?: ThemePreset;
    industrySlug?: string;
}
/**
 * VayvaThemeProvider - Manages industry themes and design categories
 */
export declare const VayvaThemeProvider: React.FC<ThemeProviderProps>;
/**
 * Hook to use theme context
 */
export declare const useVayvaTheme: () => ThemeContextType;
export {};
