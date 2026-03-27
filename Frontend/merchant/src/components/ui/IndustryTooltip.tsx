'use client';

import React, { useState } from 'react';
import { Info, X, ChevronRight, Sparkles, TrendingUp, Users, Clock, Award } from 'lucide-react';
import { Button } from '@vayva/ui';
import type { IndustryArchetype } from '../../industry-data';
import { cn } from '@/lib/utils';

interface IndustryTooltipProps {
  industry: IndustryArchetype;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function IndustryTooltip({ industry, side = 'right', align = 'start' }: IndustryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Advanced':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getArchetypeColor = (archetype: string) => {
    switch (archetype) {
      case 'commerce':
        return 'from-blue-500 to-cyan-500';
      case 'food_beverage':
        return 'from-orange-500 to-amber-500';
      case 'bookings_events':
        return 'from-purple-500 to-pink-500';
      case 'content_services':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        type="button"
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline">Learn more</span>
      </button>

      {/* Tooltip Content */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip Container */}
          <div
            className={cn(
              'absolute z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden',
              side === 'right' && 'left-full top-0 ml-2',
              side === 'left' && 'right-full top-0 mr-2',
              side === 'top' && 'bottom-full left-0 mb-2',
              side === 'bottom' && 'top-full left-0 mt-2',
              align === 'end' && side === 'right' ? 'left-auto right-0' : '',
              align === 'start' && side === 'left' ? 'left-0 right-auto' : ''
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
              type="button"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Header with Gradient */}
            <div className={cn(
              'bg-gradient-to-r p-5 text-white',
              getArchetypeColor(industry.archetype)
            )}>
              <div className="flex items-start gap-3">
                <span className="text-4xl">{industry.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{industry.name}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {industry.shortDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">
              {/* Full Description */}
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {industry.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">Setup Time</span>
                  </div>
                  <p className="text-sm text-gray-900">{industry.setupTime}</p>
                </div>
                <div className={cn(
                  'rounded-xl p-3 border',
                  getDifficultyColor(industry.difficulty)
                )}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-semibold">Difficulty</span>
                  </div>
                  <p className="text-sm font-medium">{industry.difficulty}</p>
                </div>
              </div>

              {/* Best For */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Best For</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {industry.bestFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Key Features</h4>
                </div>
                <ul className="space-y-1.5">
                  {industry.keyFeatures.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Typical Use Case */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Typical Use Case</h4>
                </div>
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  "{industry.typicalUseCase}"
                </p>
              </div>

              {/* KPIs */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Key Metrics</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {industry.kpis.map((kpi, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100"
                    >
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              {industry.integrations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Popular Integrations</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {industry.integrations.slice(0, 6).map((integration, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100"
                      >
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasonal Patterns */}
              {industry.seasonalPatterns && industry.seasonalPatterns.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">Seasonal Patterns</h4>
                  <ul className="space-y-1">
                    {industry.seasonalPatterns.map((pattern, idx) => (
                      <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance Requirements */}
              {industry.complianceRequirements && industry.complianceRequirements.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Compliance Required</h4>
                  <ul className="space-y-1">
                    {industry.complianceRequirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-red-800 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <Button
                onClick={() => {
                  // Handle selection
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                size="lg"
              >
                Choose {industry.name}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Industry Select Dropdown with Tooltips
 */
interface IndustrySelectWithTooltipProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function IndustrySelectWithTooltip({
  value,
  onChange,
  placeholder = 'Select your industry',
  label = 'Industry',
  error,
  disabled = false,
}: IndustrySelectWithTooltipProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Import industries
  const industries = Object.values(INDUSTRY_ARCHETYPES);

  // Filter industries based on search
  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.bestFor.some((target) => target.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedIndustry = value ? industries.find((i) => i.id === value) : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        <IndustryTooltip
          industry={selectedIndustry || industries[0]}
          side="top"
          align="end"
        />
      </label>
      
      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2.5 text-left bg-white border rounded-lg shadow-sm transition-all',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
      >
        {selectedIndustry ? (
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{selectedIndustry.icon}</span>
            <span className="text-gray-900 font-medium">{selectedIndustry.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Industry List */}
            <div className="overflow-y-auto max-h-80">
              {filteredIndustries.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => {
                    onChange(industry.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0',
                    value === industry.id && 'bg-blue-50 hover:bg-blue-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{industry.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{industry.name}</div>
                      <div className="text-xs text-gray-500 truncate">{industry.shortDescription}</div>
                    </div>
                    {value === industry.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              {filteredIndustries.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No industries found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Re-export industry data
export * from '../../industry-data';
