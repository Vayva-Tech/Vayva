"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "professional" | "creative" | "retail";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("professional");

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("vayva-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("vayva-theme", newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ["light", "dark", "professional", "creative", "retail"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for applying theme classes to components
export function useThemedStyles(componentName: string) {
  const { theme } = useTheme();
  
  const getThemedClass = (baseClass: string) => {
    return `${baseClass} ${baseClass}-${theme}`;
  };
  
  return {
    theme,
    getThemedClass,
    // Professional Services specific classes
    professionalCard: getThemedClass("professional-card"),
    metricCard: getThemedClass("metric-card"),
    statusBadge: getThemedClass("status-badge"),
    progressBar: getThemedClass("progress-bar"),
    timeline: getThemedClass("professional-timeline"),
    alert: getThemedClass("professional-alert"),
    button: getThemedClass("btn-professional"),
    buttonOutline: getThemedClass("btn-professional-outline"),
  };
}