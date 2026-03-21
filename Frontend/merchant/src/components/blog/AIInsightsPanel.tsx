// @ts-nocheck
'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function AIInsightsPanel(): React.JSX.Element {
  return (
    <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl border border-accent-primary/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-50-primary/20 flex items-center justify-center">
          <Icon name="Sparkles" size={20} className="text-green-600-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
          <p className="text-xs text-gray-500">Pro Tier Feature</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Topic Suggestion */}
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={18} className="text-green-600-primary mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                Trending Topic: "AI in Software Development"
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Based on: Search volume (+45%), social buzz, competitor gaps
              </p>
              <div className="flex items-center gap-4 mb-3">
                <p className="text-xs text-gray-400">
                  Estimated traffic: <span className="font-bold text-gray-900">8,000-12,000</span> monthly views
                </p>
                <p className="text-xs text-gray-400">
                  Recommended angle: <span className="font-bold text-gray-900">Practical implementation guide</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 px-3 text-xs bg-green-50-primary hover:bg-green-50-primary/90">
                  Create Outline
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-gray-100">
                  View Research
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Optimal Publishing Time */}
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <Icon name="Clock" size={18} className="text-green-600-primary mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                Optimal Publishing Times
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Your audience is most active during these windows:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white-tertiary rounded-md">
                  <p className="text-xs font-bold text-gray-900">Tuesday 10 AM</p>
                  <p className="text-xs text-gray-400">Highest engagement</p>
                </div>
                <div className="p-2 bg-white-tertiary rounded-md">
                  <p className="text-xs font-bold text-gray-900">Thursday 2 PM</p>
                  <p className="text-xs text-gray-400">Most shares</p>
                </div>
                <div className="p-2 bg-white-tertiary rounded-md">
                  <p className="text-xs font-bold text-gray-900">Saturday 9 AM</p>
                  <p className="text-xs text-gray-400">Longest read time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Gap Analysis */}
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <Icon name="Target" size={18} className="text-green-600-primary mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                Content Gap Opportunity
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Low competition keywords your competitors aren't targeting:
              </p>
              <div className="flex flex-wrap gap-2">
                {['React Server Components', 'Next.js 15 features', 'TypeScript generics'].map((tag, index) => (
                  <span key={index} className="px-3 py-1.5 bg-green-50-primary/20 text-green-600-primary text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
