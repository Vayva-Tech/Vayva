'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { GlassPanel, ProgressBar } from '@vayva/ui/components/fashion';
import { Button, Switch } from '@vayva/ui/components';

const CollectionsSettingsPage = () => {
  const [autoPublish, setAutoPublish] = useState(true);
  const [defaultView, setDefaultView] = useState('grid');
  const [seasonalCollections, setSeasonalCollections] = useState({
    springSummer: true,
    fallWinter: true,
    resort: true,
    holidayCapsule: false,
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">Collection Management</h1>
          <p className="text-white/60">Configure seasonal collections and drop schedules</p>
        </div>

        <div className="space-y-6">
          {/* Collection Settings */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>

            <div className="space-y-6">
              {/* Auto-publish */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Auto-publish Collections</span>
                  <p className="text-xs text-white/50 mt-1">Automatically publish collections when all products are added</p>
                </div>
                <Switch checked={autoPublish} onChange={setAutoPublish} />
              </label>

              {/* Default View */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Default Collection View
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'grid', label: 'Grid', icon: '▦' },
                    { value: 'list', label: 'List', icon: '☰' },
                    { value: 'masonry', label: 'Masonry', icon: '⊞' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setDefaultView(option.value)}
                      className={`px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        defaultView === option.value
                          ? 'bg-purple-400 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Lookbook Template */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Lookbook Template
                </label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400">
                  <option value="standard" className="bg-[#0F0F0F]">Standard (3:4 Portrait)</option>
                  <option value="landscape" className="bg-[#0F0F0F]">Landscape (16:9)</option>
                  <option value="square" className="bg-[#0F0F0F]">Square (1:1)</option>
                  <option value="story" className="bg-[#0F0F0F]">Story (9:16)</option>
                </select>
              </div>
            </div>
          </GlassPanel>

          {/* Seasonal Collections */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Seasonal Collections</h2>

            <div className="space-y-4">
              {[
                { key: 'springSummer', name: 'Spring/Summer', icon: '🌸', active: true },
                { key: 'fallWinter', name: 'Fall/Winter', icon: '🍂', active: true },
                { key: 'resort', name: 'Resort', icon: '🏖️', active: true },
                { key: 'holidayCapsule', name: 'Holiday Capsule', icon: '🎄', active: false },
              ].map((season) => (
                <label
                  key={season.key}
                  className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8 hover:border-purple-400/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{season.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-white">{season.name}</span>
                      <p className="text-xs text-white/50">
                        {season.active ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={seasonalCollections[season.key as keyof typeof seasonalCollections]}
                    onChange={(checked) =>
                      setSeasonalCollections({
                        ...seasonalCollections,
                        [season.key]: checked,
                      })
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Button variant="secondary" className="border-white/20 w-full">
                + Add Custom Season
              </Button>
            </div>
          </GlassPanel>

          {/* Active Collections Preview */}
          <GlassPanel variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Collections</h2>
              <Button variant="primary" className="bg-purple-400 hover:bg-purple-500">
                + New Collection
              </Button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Spring Essentials', progress: 78, items: 24, status: 'Published' },
                { name: 'Evening Wear', progress: 62, items: 18, status: 'Published' },
                { name: 'Activewear', progress: 45, items: 12, status: 'Draft' },
              ].map((collection, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/3 rounded-lg border border-white/8"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">{collection.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        collection.status === 'Published'
                          ? 'bg-emerald-400/20 text-emerald-400'
                          : 'bg-amber-400/20 text-amber-400'
                      }`}
                    >
                      {collection.status}
                    </span>
                  </div>
                  <ProgressBar value={collection.progress} max={100} size="sm" color="#A855F7" />
                  <p className="text-xs text-white/50 mt-2">{collection.items} items • {collection.progress}% complete</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-purple-400 hover:bg-purple-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsSettingsPage;

