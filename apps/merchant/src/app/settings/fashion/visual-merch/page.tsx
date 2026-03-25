'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Switch } from '@vayva/ui/components';

const VisualMerchSettingsPage = () => {
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [imageQuality, setImageQuality] = useState('high');
  const [lazyLoading, setLazyLoading] = useState(true);
  const [showSizeRange, setShowSizeRange] = useState(true);
  const [showSkinToneRange, setShowSkinToneRange] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <a href="/settings/fashion" className="text-white/40 hover:text-white transition-colors">
              ← Back
            </a>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Visual Merchandising</h1>
          <p className="text-white/60">Configure lookbook templates and asset management</p>
        </div>

        <div className="space-y-6">
          {/* Lookbook Settings */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Lookbook Settings</h2>

            <div className="space-y-6">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: '3:4', label: 'Portrait', icon: '📱' },
                    { value: '16:9', label: 'Landscape', icon: '🖥️' },
                    { value: '1:1', label: 'Square', icon: '⬜' },
                    { value: '9:16', label: 'Story', icon: '📲' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setAspectRatio(option.value)}
                      className={`px-4 py-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                        aspectRatio === option.value
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Image Quality */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Image Quality
                </label>
                <select
                  value={imageQuality}
                  onChange={(e) => setImageQuality(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="high" className="bg-[#0F0F0F]">High (WebP - Recommended)</option>
                  <option value="medium" className="bg-[#0F0F0F]">Medium (JPEG)</option>
                  <option value="low" className="bg-[#0F0F0F]">Low (Optimized for speed)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                  <div>
                    <span className="text-sm font-medium text-white">Lazy Loading</span>
                    <p className="text-xs text-white/50 mt-1">Load images as they scroll into view</p>
                  </div>
                  <Switch checked={lazyLoading} onChange={setLazyLoading} />
                </label>
              </div>
            </div>
          </GlassPanel>

          {/* Model Diversity */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Model Diversity Options</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                <div>
                  <span className="text-sm font-medium text-white">Show Size Range</span>
                  <p className="text-xs text-white/50 mt-1">Display models in different sizes</p>
                </div>
                <Switch checked={showSizeRange} onChange={setShowSizeRange} />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                <div>
                  <span className="text-sm font-medium text-white">Show Skin Tone Range</span>
                  <p className="text-xs text-white/50 mt-1">Display diverse skin tones</p>
                </div>
                <Switch checked={showSkinToneRange} onChange={setShowSkinToneRange} />
              </label>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Button variant="secondary" className="border-white/20 w-full">
                🎨 Configure Lookbook Templates
              </Button>
            </div>
          </GlassPanel>

          {/* Asset Library Preview */}
          <GlassPanel variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Asset Library</h2>
              <Button variant="primary" className="bg-amber-400 hover:bg-amber-500">
                📷 Upload New Assets
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-[3/4] bg-white/3 rounded-lg border border-white/8 overflow-hidden group cursor-pointer"
                >
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-purple-400/20 flex items-center justify-center">
                    <span className="text-4xl opacity-50">👗</span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                      ✏️
                    </Button>
                    <Button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-amber-400 hover:bg-amber-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualMerchSettingsPage;

