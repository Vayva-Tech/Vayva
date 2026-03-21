// @ts-nocheck
'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function SEOPerformance({ keywords = [] }: { keywords?: any[] }): React.JSX.Element {
  const topKeywords = keywords.length > 0 ? keywords : [
    { keyword: 'AI trends 2026', position: 3, volume: 12000 },
    { keyword: 'React hooks', position: 5, volume: 8500 },
    { keyword: 'TypeScript tips', position: 7, volume: 6200 },
    { keyword: 'Web dev best practices', position: 12, volume: 4800 },
  ];

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">SEO Performance</h3>
        <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
          SEO Audit
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Organic Traffic: 142,847 (68%)</p>
        <div className="flex gap-4 mt-2">
          <p className="text-xs text-gray-400">Domain Authority: <span className="font-bold text-gray-900">68</span></p>
          <p className="text-xs text-gray-400">Page Authority: <span className="font-bold text-gray-900">72</span></p>
          <p className="text-xs text-gray-400">Backlinks: <span className="font-bold text-gray-900">2,847</span></p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Keywords</p>
        {topKeywords.map((kw, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white-tertiary rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
              <p className="text-xs text-gray-400">Volume: {kw.volume?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-md ${
                kw.position <= 3 ? 'bg-green-50 text-green-600' :
                kw.position <= 10 ? 'bg-amber-50 text-amber-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                <p className="text-xs font-bold">#{kw.position}</p>
              </div>
              <Icon name="Search" size={16} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Technical SEO</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={14} className="text-green-600" />
            <p className="text-xs text-gray-500">Site speed: 92/100</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={14} className="text-green-600" />
            <p className="text-xs text-gray-500">Mobile-friendly</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={14} className="text-amber-600" />
            <p className="text-xs text-gray-500">Meta descriptions (8 missing)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
