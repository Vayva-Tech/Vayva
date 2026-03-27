/**
 * Creative Tools - Design & Editing Utilities
 */

import React, { useState } from 'react';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // hex codes
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: 'SOCIAL_MEDIA' | 'PRESENTATION' | 'PRINT' | 'WEB' | 'EMAIL';
  dimensions: { width: number; height: number; unit: 'PX' | 'IN' | 'CM' };
}

export interface FontPair {
  id: string;
  headingFont: string;
  bodyFont: string;
  preview: string;
}

interface CreativeToolsProps {
  palettes?: ColorPalette[];
  templates?: Template[];
  fonts?: FontPair[];
  onGenerateColor?: () => void;
  onExportPalette?: (paletteId: string) => void;
  onUseTemplate?: (templateId: string) => void;
}

export function CreativeTools({ 
  palettes = [],
  templates = [],
  fonts = [],
  onGenerateColor,
  onExportPalette,
  onUseTemplate 
}: CreativeToolsProps) {
  const [activeTab, setActiveTab] = useState<'COLORS' | 'FONTS' | 'TEMPLATES'>('COLORS');
  const [customColors, setCustomColors] = useState<string[]>(['#6366f1', '#8b5cf6', '#ec4899']);

  // Color Generator
  const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    setCustomColors([...customColors.slice(1), randomColor]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('COLORS')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'COLORS'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎨 Colors
        </button>
        <button
          onClick={() => setActiveTab('FONTS')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'FONTS'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Aa Fonts
        </button>
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'TEMPLATES'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📐 Templates
        </button>
      </div>

      {/* Color Tools */}
      {activeTab === 'COLORS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Color Palette Generator</h4>
            <button
              onClick={generateRandomColor}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              Generate New
            </button>
          </div>

          {/* Custom Palette Preview */}
          <div className="grid grid-cols-5 gap-4 h-32 rounded-lg overflow-hidden">
            {customColors.map((color, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-end pb-2 transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <span className="px-2 py-1 bg-white bg-opacity-90 text-xs font-mono rounded">
                  {color}
                </span>
              </div>
            ))}
          </div>

          {/* Saved Palettes */}
          {palettes.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-700 mb-3">Saved Palettes</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {palettes.map((palette) => (
                  <div key={palette.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <h6 className="font-medium text-sm text-gray-900 mb-2">{palette.name}</h6>
                    <div className="flex h-12 rounded overflow-hidden mb-3">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => onExportPalette?.(palette.id)}
                      className="w-full px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                    >
                      Export CSS
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Font Tools */}
      {activeTab === 'FONTS' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Font Pairings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fonts.map((font) => (
                <div key={font.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <p 
                      className="text-2xl font-bold mb-2"
                      style={{ fontFamily: font.headingFont }}
                    >
                      {font.preview.split('\n')[0]}
                    </p>
                    <p 
                      className="text-base"
                      style={{ fontFamily: font.bodyFont }}
                    >
                      {font.preview.split('\n')[1] || 'The quick brown fox jumps over the lazy dog.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{font.headingFont} + {font.bodyFont}</span>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                      Use Pairing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Design Templates</h4>
            <select className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
              <option>All Categories</option>
              <option>Social Media</option>
              <option>Presentation</option>
              <option>Print</option>
              <option>Web</option>
              <option>Email</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-100">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h5 className="font-medium text-sm text-gray-900 mb-1">{template.name}</h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {template.dimensions.width} × {template.dimensions.height} {template.dimensions.unit}
                  </p>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {template.category.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onUseTemplate?.(template.id)}
                    className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No templates available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
