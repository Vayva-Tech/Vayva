'use client';

import React from 'react';
import { VayvaThemeProvider, useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import { VayvaCard, VayvaCardHeader, VayvaCardTitle, VayvaCardContent } from '@/components/vayva-ui/VayvaCard';
import { VayvaButton } from '@/components/vayva-ui/VayvaButton';
import { FashionKPICard, GradientOrbs } from '@/components/vayva-ui/fashion/KPICards';
import { SizeCurveChart } from '@/components/vayva-ui/fashion/SizeCurveChart';
import { VisualMerchandisingBoard } from '@/components/vayva-ui/fashion/VisualMerchandisingBoard';
import { cn } from '@/lib/utils';

/**
 * Fashion Industry Dashboard - Premium Glassmorphism Design
 * 
 * Features:
 * - Frosted glass cards on gradient background
 * - Animated gradient orbs
 * - Fashion-specific widgets (Size Curve, Visual Merchandising)
 * - 5 theme presets (Rose Gold, Ocean Breeze, Forest Mist, Midnight Luxe, Sunset Vibes)
 * - Vayva branding integration
 */

// Mock data for demonstration
const sizeCurveData = [
  { size: 'XS', inventory: 145, sales: 89, stockoutRisk: 'medium' as const },
  { size: 'S', inventory: 234, sales: 156, stockoutRisk: 'low' as const },
  { size: 'M', inventory: 312, sales: 198, stockoutRisk: 'low' as const },
  { size: 'L', inventory: 189, sales: 134, stockoutRisk: 'medium' as const },
  { size: 'XL', inventory: 98, sales: 67, stockoutRisk: 'high' as const },
  { size: 'XXL', inventory: 45, sales: 34, stockoutRisk: 'high' as const },
];

const collectionItems = [
  {
    id: '1',
    name: 'Summer Floral Dress',
    image: '/images/fashion/dress-1.jpg',
    category: 'Dresses',
    performance: 'trending' as const,
    revenue: 12450,
    unitsSold: 234,
  },
  {
    id: '2',
    name: 'Classic White Blazer',
    image: '/images/fashion/blazer-1.jpg',
    category: 'Outerwear',
    performance: 'stable' as const,
    revenue: 8900,
    unitsSold: 156,
  },
  {
    id: '3',
    name: 'High-Waist Jeans',
    image: '/images/fashion/jeans-1.jpg',
    category: 'Bottoms',
    performance: 'trending' as const,
    revenue: 15600,
    unitsSold: 312,
  },
  {
    id: '4',
    name: 'Silk Scarf',
    image: '/images/fashion/scarf-1.jpg',
    category: 'Accessories',
    performance: 'declining' as const,
    revenue: 3200,
    unitsSold: 89,
  },
];

function FashionDashboardContent() {
  const { designCategory, themePreset, setThemePreset } = useVayvaTheme();

  return (
    <div className="min-h-screen relative">
      {/* Animated Gradient Background Orbs */}
      <GradientOrbs />
      
      {/* Header with Theme Switcher */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fashion Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Premium collection analytics</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Preset Selector */}
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl p-2 border border-white/40">
                {['default', 'rose-gold', 'ocean-breeze', 'forest-mist', 'midnight-luxe', 'sunset-vibes'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setThemePreset(preset as any)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-all',
                      themePreset === preset
                        ? 'bg-white shadow-sm font-medium'
                        : 'hover:bg-white/50'
                    )}
                  >
                    {preset.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
              
              <VayvaButton variant="primary" size="md">
                Export Report
              </VayvaButton>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Dashboard Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FashionKPICard
            title="Total Revenue"
            value="$124,580"
            change={12.5}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            gradient="from-indigo-500 via-purple-500 to-pink-500"
          />
          
          <FashionKPICard
            title="Sell-Through Rate"
            value="68.4%"
            change={5.2}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            gradient="from-green-500 via-emerald-500 to-teal-500"
          />
          
          <FashionKPICard
            title="Average Order Value"
            value="$284"
            change={-2.1}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 15H4L5 9z" />
              </svg>
            }
            gradient="from-orange-500 via-amber-500 to-yellow-500"
          />
          
          <FashionKPICard
            title="Return Rate"
            value="8.2%"
            change={-1.4}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            }
            gradient="from-pink-500 via-rose-500 to-red-500"
          />
        </div>
        
        {/* Size Curve Analysis */}
        <div className="mb-8">
          <SizeCurveChart data={sizeCurveData} className="w-full" />
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visual Merchandising Board */}
          <VisualMerchandisingBoard items={collectionItems} />
          
          {/* Collection Performance */}
          <VayvaCard variant="glass" className="p-6">
            <VayvaCardHeader>
              <VayvaCardTitle>Collection Performance</VayvaCardTitle>
              <div className="text-sm text-gray-500">Spring/Summer 2026</div>
            </VayvaCardHeader>
            
            <VayvaCardContent>
              <div className="space-y-4">
                {[
                  { name: 'Floral Dresses', progress: 78, revenue: '$45,280' },
                  { name: 'Linen Sets', progress: 65, revenue: '$32,150' },
                  { name: 'Accessories', progress: 45, revenue: '$18,900' },
                  { name: 'Footwear', progress: 92, revenue: '$56,400' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="font-semibold text-gray-900">{item.revenue}</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </VayvaCardContent>
          </VayvaCard>
        </div>
        
        {/* Bottom Section - Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Products */}
          <VayvaCard variant="glass" className="p-6">
            <VayvaCardHeader>
              <VayvaCardTitle>Trending Now</VayvaCardTitle>
            </VayvaCardHeader>
            <VayvaCardContent>
              <ul className="space-y-3">
                {[
                  { name: 'Maxi Skirts', growth: '+145%' },
                  { name: 'Crop Tops', growth: '+98%' },
                  { name: 'Platform Sandals', growth: '+87%' },
                  { name: 'Statement Earrings', growth: '+76%' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-green-600 font-semibold">{item.growth}</span>
                  </li>
                ))}
              </ul>
            </VayvaCardContent>
          </VayvaCard>
          
          {/* Inventory Alerts */}
          <VayvaCard variant="glass" className="p-6">
            <VayvaCardHeader>
              <VayvaCardTitle>Inventory Alerts</VayvaCardTitle>
            </VayvaCardHeader>
            <VayvaCardContent>
              <div className="space-y-3">
                {[
                  { item: 'Size XL - Black Dress', status: 'Low Stock', quantity: 12 },
                  { item: 'Size XXL - White Blazer', status: 'Critical', quantity: 3 },
                  { item: 'Denim Jacket - Medium', status: 'Restock Soon', quantity: 18 },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{alert.item}</div>
                      <div className="text-xs text-gray-500">{alert.quantity} units left</div>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      alert.status === 'Critical' 
                        ? 'bg-red-100 text-red-700' 
                        : alert.status === 'Low Stock'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    )}>
                      {alert.status}
                    </span>
                  </div>
                ))}
              </div>
            </VayvaCardContent>
          </VayvaCard>
          
          {/* Recent Activity */}
          <VayvaCard variant="glass" className="p-6">
            <VayvaCardHeader>
              <VayvaCardTitle>Recent Activity</VayvaCardTitle>
            </VayvaCardHeader>
            <VayvaCardContent>
              <ul className="space-y-3 text-sm">
                {[
                  { action: 'New order placed', time: '2 min ago', type: 'order' },
                  { action: 'Product restocked', time: '15 min ago', type: 'inventory' },
                  { action: 'Review received', time: '1 hour ago', type: 'review' },
                  { action: 'Collection published', time: '3 hours ago', type: 'product' },
                ].map((activity, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'inventory' ? 'bg-blue-500' :
                      activity.type === 'review' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    )} />
                    <span className="text-gray-700 flex-1">{activity.action}</span>
                    <span className="text-gray-400 text-xs">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </VayvaCardContent>
          </VayvaCard>
        </div>
      </main>
    </div>
  );
}

/**
 * Fashion Dashboard Page Component
 * Wrapped with Theme Provider
 */
export default function FashionDashboardPage() {
  return (
    <VayvaThemeProvider defaultCategory="glass" defaultPreset="rose-gold">
      <FashionDashboardContent />
    </VayvaThemeProvider>
  );
}
