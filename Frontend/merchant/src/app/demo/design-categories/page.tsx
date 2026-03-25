'use client';
import React, { useState } from 'react';
import { VayvaThemeProvider } from '@/components/vayva-ui/VayvaThemeProvider';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
import type { IndustrySlug } from '@/lib/templates/types';

const INDUSTRY_EXAMPLES: Array<{ 
  slug: IndustrySlug; 
  name: string; 
  category: DesignCategory;
  description: string;
}> = [
  { slug: 'fashion', name: 'Fashion & Apparel', category: 'glass', description: 'Premium glassmorphism design for luxury fashion brands' },
  { slug: 'food', name: 'Restaurant & Food', category: 'bold', description: 'High-energy bold design for restaurants and food services' },
  { slug: 'automotive', name: 'Automotive', category: 'dark', description: 'Modern dark theme for automotive dealerships' },
  { slug: 'travel_hospitality', name: 'Travel & Hospitality', category: 'natural', description: 'Warm natural tones for travel and hospitality' },
  { slug: 'retail', name: 'General Retail', category: 'signature', description: 'Clean professional design for general retail businesses' },
];

export default function DesignCategoriesDemo() {
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRY_EXAMPLES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Category Showcase</h1>
          <p className="text-gray-600">
            Preview how different industries render with their assigned design categories
          </p>
        </div>

        {/* Industry Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Industry to Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {INDUSTRY_EXAMPLES.map((industry) => (
                <Button
                  key={industry.slug}
                  onClick={() => setSelectedIndustry(industry)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedIndustry.slug === industry.slug
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1",
                      industry.category === 'glass' && "bg-gradient-to-r from-pink-500 to-red-500",
                      industry.category === 'bold' && "bg-orange-500",
                      industry.category === 'dark' && "bg-gray-800",
                      industry.category === 'natural' && "bg-orange-500",
                      industry.category === 'signature' && "bg-blue-500"
                    )} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{industry.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{industry.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant={isFullscreen ? "outline" : "default"}
              >
                {isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedIndustry.name} Dashboard Preview
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({selectedIndustry.category} design category)
                </span>
              </CardTitle>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                selectedIndustry.category === 'glass' && "bg-pink-100 text-pink-800",
                selectedIndustry.category === 'bold' && "bg-orange-100 text-orange-800",
                selectedIndustry.category === 'dark' && "bg-gray-800 text-gray-100",
                selectedIndustry.category === 'natural' && "bg-orange-100 text-amber-800",
                selectedIndustry.category === 'signature' && "bg-blue-100 text-blue-800"
              )}>
                {selectedIndustry.category.toUpperCase()}
              </div>
            </div>
          </CardHeader>
          <CardContent className={isFullscreen ? "p-0" : "p-6"}>
            <VayvaThemeProvider 
              defaultCategory={selectedIndustry.category}
              industrySlug={selectedIndustry.slug}
            >
              <div className={isFullscreen ? "" : "max-h-[70vh] overflow-y-auto"}>
                <UniversalProDashboard
                  industry={selectedIndustry.slug as any}
                  variant="pro"
                  userId="demo-user"
                  businessId="demo-business"
                />
              </div>
            </VayvaThemeProvider>
          </CardContent>
        </Card>

        {/* Design Category Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Design Category Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  category: 'signature',
                  title: 'Signature Clean',
                  industries: ['Retail', 'Electronics', 'Education', 'Services'],
                  description: 'Clean white backgrounds, subtle grays, blue accents',
                  bgColor: 'bg-gradient-to-br from-blue-50 to-green-50'
                },
                {
                  category: 'glass',
                  title: 'Premium Glass',
                  industries: ['Fashion', 'Beauty', 'Real Estate'],
                  description: 'Glassmorphism effects, rose-gold gradients',
                  bgColor: 'bg-gradient-to-br from-pink-50 via-purple-50 to-red-50'
                },
                {
                  category: 'bold',
                  title: 'Bold Energy',
                  industries: ['Restaurant', 'Events', 'Nightlife'],
                  description: 'Thick borders, vibrant colors, high visual impact',
                  bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50'
                },
                {
                  category: 'dark',
                  title: 'Modern Dark',
                  industries: ['Automotive', 'Tech', 'SaaS'],
                  description: 'Dark backgrounds, neon accents, high contrast',
                  bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
                },
                {
                  category: 'natural',
                  title: 'Natural Warmth',
                  industries: ['Travel', 'Wellness', 'Nonprofit', 'Grocery'],
                  description: 'Warm earth tones, organic shapes, amber accents',
                  bgColor: 'bg-gradient-to-b from-amber-50 to-yellow-50'
                }
              ].map((design) => (
                <div 
                  key={design.category}
                  className={cn(
                    "p-4 rounded-xl border",
                    design.category === selectedIndustry.category 
                      ? "border-blue-300 ring-2 ring-blue-100" 
                      : "border-gray-200"
                  )}
                >
                  <div className={cn("h-16 rounded-lg mb-3", design.bgColor)} />
                  <h3 className="font-semibold text-gray-900 mb-2">{design.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{design.description}</p>
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Industries:</span>
                    <ul className="mt-1 space-y-1">
                      {design.industries.map(industry => (
                        <li key={industry} className="text-gray-500">• {industry}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
