// @ts-nocheck
import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: string;
}

export interface ThemeCustomizerProps {
  currentTheme?: ThemeConfig;
  onThemeChange?: (theme: ThemeConfig) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'advanced'>('presets');

  const presets: ThemeConfig[] = [
    {
      id: 'rose-gold',
      name: 'Rose Gold',
      primaryColor: '#E8B4B8',
      accentColor: '#D4A5A9',
      backgroundColor: '#0F0F0F',
      textColor: '#FFFFFF',
      borderRadius: 'xl',
      fontFamily: 'Inter',
    },
    {
      id: 'champagne',
      name: 'Champagne',
      primaryColor: '#F7E7CE',
      accentColor: '#E6D2B5',
      backgroundColor: '#1A1A1A',
      textColor: '#FFFFFF',
      borderRadius: 'lg',
      fontFamily: 'Playfair Display',
    },
    {
      id: 'sapphire',
      name: 'Sapphire',
      primaryColor: '#0F52BA',
      accentColor: '#083D8A',
      backgroundColor: '#0A0A0A',
      textColor: '#FFFFFF',
      borderRadius: 'md',
      fontFamily: 'Montserrat',
    },
    {
      id: 'emerald',
      name: 'Emerald',
      primaryColor: '#50C878',
      accentColor: '#3DA569',
      backgroundColor: '#0D1117',
      textColor: '#FFFFFF',
      borderRadius: 'lg',
      fontFamily: 'Poppins',
    },
    {
      id: 'velvet',
      name: 'Velvet',
      primaryColor: '#7B1FA2',
      accentColor: '#6A1B9A',
      backgroundColor: '#121212',
      textColor: '#FFFFFF',
      borderRadius: 'xl',
      fontFamily: 'Raleway',
    },
  ];

  const handlePresetSelect = (preset: ThemeConfig) => {
    onThemeChange?.(preset);
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Theme Customizer</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'presets'
                ? 'bg-rose-400 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'advanced'
                ? 'bg-rose-400 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentTheme?.id === preset.id
                  ? 'border-rose-400 bg-rose-400/10'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.accentColor})` }}
                />
                <span className="text-sm font-semibold text-white">{preset.name}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <span className="text-xs text-white/60">{preset.primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span className="text-xs text-white/60">{preset.accentColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Font:</span>
                  <span className="text-xs text-white/80">{preset.fontFamily}</span>
                </div>
              </div>

              {currentTheme?.id === preset.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Color Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme?.primaryColor || '#E8B4B8'}
                  onChange={(e) =>
                    onThemeChange?.({ ...currentTheme!, primaryColor: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme?.primaryColor || '#E8B4B8'}
                  onChange={(e) =>
                    onThemeChange?.({ ...currentTheme!, primaryColor: e.target.value })
                  }
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme?.accentColor || '#D4A5A9'}
                  onChange={(e) =>
                    onThemeChange?.({ ...currentTheme!, accentColor: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme?.accentColor || '#D4A5A9'}
                  onChange={(e) =>
                    onThemeChange?.({ ...currentTheme!, accentColor: e.target.value })
                  }
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Border Radius
            </label>
            <div className="grid grid-cols-5 gap-3">
              {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
                <button
                  key={radius}
                  onClick={() => onThemeChange?.({ ...currentTheme!, borderRadius: radius })}
                  className={`px-4 py-3 rounded-lg border transition-all capitalize ${
                    currentTheme?.borderRadius === radius
                      ? 'bg-rose-400 border-rose-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {radius}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Font Family
            </label>
            <select
              value={currentTheme?.fontFamily || 'Inter'}
              onChange={(e) =>
                onThemeChange?.({ ...currentTheme!, fontFamily: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-400"
            >
              <option value="Inter" className="bg-[#0F0F0F]">Inter</option>
              <option value="Playfair Display" className="bg-[#0F0F0F]">Playfair Display</option>
              <option value="Montserrat" className="bg-[#0F0F0F]">Montserrat</option>
              <option value="Poppins" className="bg-[#0F0F0F]">Poppins</option>
              <option value="Raleway" className="bg-[#0F0F0F]">Raleway</option>
            </select>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

export default ThemeCustomizer;
