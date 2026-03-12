import React, { useState, useEffect } from 'react';
import { industryThemes, ThemePreset, applyTheme, getCurrentTheme } from '../industry-themes';

interface ThemeCustomizerProps {
  onThemeChange?: (themeId: string) => void;
  className?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  onThemeChange,
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>('');

  useEffect(() => {
    setCurrentTheme(getCurrentTheme() || 'corporate');
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    onThemeChange?.(themeId);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Customization</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Industry Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(industryThemes).map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentTheme === theme.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{theme.name}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: industryThemes[currentTheme]?.colors.primary }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: industryThemes[currentTheme]?.colors.primary }}
              >
                {industryThemes[currentTheme]?.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              This is how your theme will look with the selected color scheme and typography.
            </p>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: industryThemes[currentTheme]?.colors.primary,
                color: '#ffffff'
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.values(industryThemes).map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={`${sizeClasses[size]} rounded-lg border-2 transition-all ${
            currentTheme === theme.id
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          title={theme.name}
        >
          <div className="flex flex-col items-center space-y-1">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <span className="text-xs font-medium text-gray-700">
              {theme.name}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

interface ThemePreviewProps {
  theme: ThemePreset;
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  className = ''
}) => {
  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-sm border ${className}`}
      style={{ 
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.primary + '40'
      }}
    >
      {/* Header */}
      <div 
        className="p-3 border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary + '20'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: theme.colors.primary }}
            >
              {theme.name}
            </span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div 
          className="h-4 rounded mb-3"
          style={{ 
            backgroundColor: theme.colors.primary + '20',
            width: '60%'
          }}
        />
        <div 
          className="h-3 rounded mb-2"
          style={{ 
            backgroundColor: theme.colors.primary + '10',
            width: '80%'
          }}
        />
        <div 
          className="h-3 rounded mb-4"
          style={{ 
            backgroundColor: theme.colors.primary + '10',
            width: '70%'
          }}
        />
        
        <div className="flex space-x-2">
          <button
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: '#ffffff'
            }}
          >
            Primary
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium border"
            style={{ 
              borderColor: theme.colors.secondary,
              color: theme.colors.secondary
            }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
};