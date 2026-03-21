'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getDesignCategoryForIndustry } from '@/config/industry-design-categories';
const ThemeContext = createContext(undefined);
/**
 * VayvaThemeProvider - Manages industry themes and design categories
 */
export const VayvaThemeProvider = ({ children, defaultCategory = 'signature', defaultPreset = 'default', industrySlug, }) => {
    const [designCategory, setDesignCategory] = useState(() => {
        // Priority: 1. Industry default, 2. Saved preference, 3. Prop default
        if (industrySlug) {
            const industryCategory = getDesignCategoryForIndustry(industrySlug);
            return industryCategory;
        }
        const savedCategory = localStorage.getItem('vayva-design-category');
        return savedCategory || defaultCategory;
    });
    const [themePreset, setThemePreset] = useState(() => {
        const savedPreset = localStorage.getItem('vayva-theme-preset');
        return savedPreset || defaultPreset;
    });
    const [customColors, setCustomColors] = useState({});
    const [mounted, setMounted] = useState(false);
    // Load saved preferences on mount
    useEffect(() => {
        setMounted(true);
        const savedCategory = localStorage.getItem('vayva-design-category');
        const savedPreset = localStorage.getItem('vayva-theme-preset');
        if (savedCategory)
            setDesignCategory(savedCategory);
        if (savedPreset)
            setThemePreset(savedPreset);
    }, []);
    // Save preferences when changed
    useEffect(() => {
        if (!mounted)
            return;
        localStorage.setItem('vayva-design-category', designCategory);
        localStorage.setItem('vayva-theme-preset', themePreset);
        // Apply CSS variables
        applyTheme(designCategory, themePreset, customColors);
    }, [designCategory, themePreset, customColors, mounted]);
    return (_jsx(ThemeContext.Provider, { value: {
            designCategory,
            themePreset,
            setDesignCategory,
            setThemePreset,
            customColors,
            setCustomColors,
        }, children: _jsx("div", { className: cn('min-h-screen transition-colors duration-300', getBackgroundClass(designCategory)), "data-design-category": designCategory, "data-theme-preset": themePreset, children: children }) }));
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
function applyTheme(category, preset, customColors) {
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
 */
function getThemeColors(category, preset) {
    const presets = {
        // Glass category presets (Fashion, Beauty, Real Estate)
        'rose-gold': {
            'gradient-primary': 'linear-gradient(135deg, #F472B6 0%, #FDB4A4 50%, #FCD34D 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
            'background-base': '#FFF5F7',
            'card-bg': 'rgba(255, 255, 255, 0.85)',
            'card-border': 'rgba(255, 255, 255, 0.4)',
            'text-primary': '#1F2937',
            'text-secondary': '#6B7280',
            'accent-glow': 'rgba(236, 72, 153, 0.3)',
        },
        'ocean-breeze': {
            'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #14B8A6 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
            'background-base': '#F0F9FF',
            'card-bg': 'rgba(255, 255, 255, 0.85)',
            'card-border': 'rgba(255, 255, 255, 0.4)',
            'text-primary': '#0C4A6E',
            'text-secondary': '#64748B',
            'accent-glow': 'rgba(14, 165, 233, 0.3)',
        },
        'forest-mist': {
            'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            'background-base': '#F0FDF4',
            'card-bg': 'rgba(255, 255, 255, 0.85)',
            'card-border': 'rgba(255, 255, 255, 0.4)',
            'text-primary': '#14532D',
            'text-secondary': '#6B7280',
            'accent-glow': 'rgba(16, 185, 129, 0.3)',
        },
        'midnight-luxe': {
            'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
            'background-base': '#F5F3FF',
            'card-bg': 'rgba(255, 255, 255, 0.85)',
            'card-border': 'rgba(255, 255, 255, 0.4)',
            'text-primary': '#2E1065',
            'text-secondary': '#6D28D9',
            'accent-glow': 'rgba(139, 92, 246, 0.3)',
        },
        'sunset-vibes': {
            'gradient-primary': 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
            'background-base': '#FFF7ED',
            'card-bg': 'rgba(255, 255, 255, 0.85)',
            'card-border': 'rgba(255, 255, 255, 0.4)',
            'text-primary': '#431407',
            'text-secondary': '#9A3412',
            'accent-glow': 'rgba(249, 115, 22, 0.3)',
        },
        // Creative Agency presets (from BATCH_5_DESIGN_CREATIVE.md)
        'creative-purple': {
            'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
            'background-base': '#F5F3FF',
            'card-bg': 'rgba(255, 255, 255, 0.9)',
            'card-border': 'rgba(139, 92, 246, 0.2)',
            'text-primary': '#1E293B',
            'text-secondary': '#64748B',
            'accent-glow': 'rgba(139, 92, 246, 0.3)',
        },
        'innovation-blue': {
            'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
            'background-base': '#EFF6FF',
            'card-bg': 'rgba(255, 255, 255, 0.9)',
            'card-border': 'rgba(59, 130, 246, 0.2)',
            'text-primary': '#1E293B',
            'text-secondary': '#64748B',
            'accent-glow': 'rgba(59, 130, 246, 0.3)',
        },
        'energy-orange': {
            'gradient-primary': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
            'background-base': '#FFFBEB',
            'card-bg': 'rgba(255, 255, 255, 0.9)',
            'card-border': 'rgba(245, 158, 11, 0.2)',
            'text-primary': '#1E293B',
            'text-secondary': '#64748B',
            'accent-glow': 'rgba(245, 158, 11, 0.3)',
        },
        // Default fallback
        'default': {
            'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            'gradient-secondary': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            'background-base': '#F9FAFB',
            'card-bg': '#FFFFFF',
            'card-border': '#E5E7EB',
            'text-primary': '#1F2937',
            'text-secondary': '#6B7280',
            'accent-glow': 'rgba(99, 102, 241, 0.15)',
        },
    };
    return presets[preset] || presets['default'];
}
/**
 * Get background class for design category
 */
function getBackgroundClass(category) {
    switch (category) {
        case 'glass':
            return 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
        case 'bold':
            return 'bg-white';
        case 'dark':
            return 'bg-gray-900';
        case 'natural':
            return 'bg-amber-50';
        case 'signature':
        default:
            return 'bg-gray-50';
    }
}
