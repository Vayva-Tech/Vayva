'use client';

import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

const FashionSettingsPage = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fashion Settings</h1>
          <p className="text-white/60">Configure your fashion-specific store settings</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Size Guide */}
          <a href="/settings/fashion/size-guide" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-400/20 flex items-center justify-center">
                  <span className="text-2xl">📏</span>
                </div>
                <span className="text-rose-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Size Guide</h3>
              <p className="text-sm text-white/60">
                Manage size charts, measurements, and fit recommendations
              </p>
            </GlassPanel>
          </a>

          {/* Collections */}
          <a href="/settings/fashion/collections" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-400/20 flex items-center justify-center">
                  <span className="text-2xl">👗</span>
                </div>
                <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Collections</h3>
              <p className="text-sm text-white/60">
                Configure seasonal collections and drop schedules
              </p>
            </GlassPanel>
          </a>

          {/* Visual Merchandising */}
          <a href="/settings/fashion/visual-merch" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visual Merchandising</h3>
              <p className="text-sm text-white/60">
                Lookbook templates and asset management
              </p>
            </GlassPanel>
          </a>

          {/* Inventory */}
          <a href="/settings/fashion/inventory" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Inventory Alerts</h3>
              <p className="text-sm text-white/60">
                Stock thresholds and restock notifications
              </p>
            </GlassPanel>
          </a>

          {/* Wholesale */}
          <a href="/settings/fashion/wholesale" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Wholesale Pricing</h3>
              <p className="text-sm text-white/60">
                B2B pricing tiers and customer management
              </p>
            </GlassPanel>
          </a>

          {/* Trends */}
          <a href="/settings/fashion/trends" className="group">
            <GlassPanel variant="interactive" hoverEffect className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-pink-400/20 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="text-pink-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trend Analytics</h3>
              <p className="text-sm text-white/60">
                Trend data sources and forecasting settings
              </p>
            </GlassPanel>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FashionSettingsPage;
