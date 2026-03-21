'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Input } from '@vayva/ui/components';

const BrandProfilePage = () => {
  const [brandData, setBrandData] = useState({
    name: 'Fashion Brand',
    tagline: 'Elevating Style Since 2024',
    description: 'Premium fashion retailer specializing in contemporary women\'s wear.',
    logo: null as File | null,
    coverImage: null as File | null,
    website: 'https://fashionbrand.com',
    instagram: '@fashionbrand',
    tiktok: '@fashionbrand',
    pinterest: '@fashionbrand',
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Brand Profile</h1>
          <p className="text-white/60">Manage your brand identity and presence</p>
        </div>

        <div className="space-y-6">
          {/* Visual Identity */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Visual Identity</h2>

            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Cover Image
              </label>
              <div className="aspect-[3/1] bg-gradient-to-r from-rose-400/20 to-purple-400/20 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-400/50 transition-colors flex items-center justify-center cursor-pointer relative overflow-hidden">
                {brandData.coverImage ? (
                  <div className="absolute inset-0 bg-cover bg-center opacity-50" />
                ) : null}
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🖼️</span>
                  <p className="text-sm text-white/60">Click to upload cover image</p>
                  <p className="text-xs text-white/40 mt-1">Recommended: 1920x640px</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setBrandData({ ...brandData, coverImage: file });
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Brand Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/3 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-400/50 transition-colors flex items-center justify-center cursor-pointer relative overflow-hidden">
                  {brandData.logo ? (
                    <div className="w-full h-full bg-cover bg-center" />
                  ) : (
                    <span className="text-3xl">🎨</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBrandData({ ...brandData, logo: file });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-2">Upload your brand logo</p>
                  <p className="text-xs text-white/40">PNG or JPG, minimum 500x500px</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Brand Information */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Brand Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Brand Name
                </label>
                <Input
                  value={brandData.name}
                  onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Tagline
                </label>
                <Input
                  value={brandData.tagline}
                  onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                  className="w-full"
                  placeholder="Your brand's unique value proposition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Description
                </label>
                <textarea
                  value={brandData.description}
                  onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-400 resize-none"
                  placeholder="Tell customers about your brand story..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Website URL
                </label>
                <Input
                  value={brandData.website}
                  onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                  className="w-full"
                  placeholder="https://yourbrand.com"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Social Media */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Social Media Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  📸 Instagram
                </label>
                <Input
                  value={brandData.instagram}
                  onChange={(e) => setBrandData({ ...brandData, instagram: e.target.value })}
                  className="w-full"
                  placeholder="@yourbrand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  🎵 TikTok
                </label>
                <Input
                  value={brandData.tiktok}
                  onChange={(e) => setBrandData({ ...brandData, tiktok: e.target.value })}
                  className="w-full"
                  placeholder="@yourbrand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  📌 Pinterest
                </label>
                <Input
                  value={brandData.pinterest}
                  onChange={(e) => setBrandData({ ...brandData, pinterest: e.target.value })}
                  className="w-full"
                  placeholder="@yourbrand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  ▶️ YouTube
                </label>
                <Input
                  className="w-full"
                  placeholder="Your channel URL"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-rose-400 hover:bg-rose-500">
              Save Brand Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandProfilePage;
