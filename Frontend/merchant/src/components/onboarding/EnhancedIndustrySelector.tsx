// @ts-nocheck
/**
 * Enhanced Industry Selector Component
 * Simplified, categorized industry selection with smart suggestions
 */

import { useState, useMemo } from "react";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { 
  MagnifyingGlass, 
  Sparkle, 
  Check, 
  Buildings,
  ForkKnife,
  Wrench,
  Laptop,
  Scale,
  Flask
} from "@phosphor-icons/react/ssr";

interface EnhancedIndustrySelectorProps {
  value: IndustrySlug;
  onChange: (industry: IndustrySlug) => void;
  businessName?: string;
  disabled?: boolean;
}

const INDUSTRY_CATEGORIES = {
  "Commerce & Retail": {
    icon: Buildings,
    industries: ["retail", "fashion", "electronics", "beauty", "grocery", "marketplace"],
    color: "text-blue-600"
  },
  "Food & Restaurants": {
    icon: ForkKnife,
    industries: ["food", "restaurant", "catering"],
    color: "text-orange-600"
  },
  "Services & Booking": {
    icon: Wrench,
    industries: ["services", "salon", "spa", "healthcare", "fitness", "legal", "real_estate", "automotive"],
    color: "text-green-600"
  },
  "Digital & Online": {
    icon: Laptop,
    industries: ["digital", "education", "blog_media", "creative_portfolio", "events"],
    color: "text-purple-600"
  },
  "Professional": {
    icon: Scale,
    industries: ["jobs", "nonprofit", "saas"],
    color: "text-green-600"
  },
  "Specialized": {
    icon: Flask,
    industries: ["b2b", "wholesale", "one_product", "professional_services", "travel", "wellness", "nightlife"],
    color: "text-red-600"
  }
};

export function EnhancedIndustrySelector({
  value,
  onChange,
  businessName = "",
  disabled = false
}: EnhancedIndustrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get smart recommendations based on business name
  const smartRecommendations = useMemo(() => {
    if (!businessName.trim()) return [];
    
    const name = businessName.toLowerCase();
    const recommendations: IndustrySlug[] = [];

    // Fashion/Beauty related
    if (name.includes('fashion') || name.includes('style') || name.includes('clothing') || 
        name.includes('boutique') || name.includes('apparel') || name.includes('wear')) {
      recommendations.push('fashion');
    }
    
    // Beauty/Cosmetics
    if (name.includes('beauty') || name.includes('cosmetic') || name.includes('skincare') || 
        name.includes('makeup') || name.includes('spa') || name.includes('salon')) {
      recommendations.push('beauty', 'services');
    }
    
    // Food/Restaurant
    if (name.includes('food') || name.includes('restaurant') || name.includes('cafe') || 
        name.includes('kitchen') || name.includes('cuisine') || name.includes('eat')) {
      recommendations.push('food', 'restaurant');
    }
    
    // Electronics/Tech
    if (name.includes('tech') || name.includes('electronic') || name.includes('gadget') || 
        name.includes('device') || name.includes('phone') || name.includes('computer')) {
      recommendations.push('electronics');
    }
    
    // Services
    if (name.includes('service') || name.includes('consult') || name.includes('coach') || 
        name.includes('therapy') || name.includes('clean') || name.includes('repair')) {
      recommendations.push('services');
    }
    
    // Education/Learning
    if (name.includes('school') || name.includes('academy') || name.includes('learn') || 
        name.includes('course') || name.includes('training') || name.includes('education')) {
      recommendations.push('education');
    }
    
    // Remove duplicates and limit to 3 recommendations
    return [...new Set(recommendations)].slice(0, 3);
  }, [businessName]);

  // Filter industries based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return INDUSTRY_CATEGORIES;
    
    const filtered: typeof INDUSTRY_CATEGORIES = {};
    const lowerSearch = searchTerm.toLowerCase();
    
    Object.entries(INDUSTRY_CATEGORIES).forEach(([category, config]) => {
      const matchingIndustries = config.industries.filter(slug => {
        const industry = INDUSTRY_CONFIG[slug as IndustrySlug];
        return (
          industry?.displayName.toLowerCase().includes(lowerSearch) ||
          slug.toLowerCase().includes(lowerSearch) ||
          industry?.description?.toLowerCase().includes(lowerSearch)
        );
      });
      
      if (matchingIndustries.length > 0) {
        filtered[category] = {
          ...config,
          industries: matchingIndustries
        };
      }
    });
    
    return filtered;
  }, [searchTerm]);

  const selectedIndustry = INDUSTRY_CONFIG[value];

  return (
    <div className="space-y-3">
      {/* Selected Industry Display */}
      <div 
        className="relative bg-white border-2 border-gray-100 rounded-xl p-4 cursor-pointer hover:border-vayva-green transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vayva-green/10 rounded-lg flex items-center justify-center">
              {selectedIndustry?.icon ? (
                <selectedIndustry.icon className="w-5 h-5 text-vayva-green" />
              ) : (
                <Buildings className="w-5 h-5 text-vayva-green" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {selectedIndustry?.displayName || "Select Industry"}
              </p>
              {selectedIndustry?.description && (
                <p className="text-sm text-gray-500 truncate max-w-xs">
                  {selectedIndustry.description}
                </p>
              )}
            </div>
          </div>
          <div className="i-ph-caret-down text-gray-400 transform transition-transform" 
               style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-1 max-h-96 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 focus:border-vayva-green focus:ring-1 focus:ring-vayva-green outline-none text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {/* Smart Recommendations */}
            {smartRecommendations.length > 0 && !searchTerm && (
              <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-vayva-green/5 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkle className="w-4 h-4 text-vayva-green" />
                  <h4 className="font-bold text-sm text-gray-900">Smart Matches</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {smartRecommendations.map((slug) => {
                    const industry = INDUSTRY_CONFIG[slug];
                    if (!industry) return null;
                    
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          onChange(slug);
                          setIsOpen(false);
                          setSearchTerm("");
                        }}
                        className="flex items-center justify-between p-3 rounded-lg border border-vayva-green/30 bg-white hover:bg-vayva-green/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-vayva-green/20 rounded-lg flex items-center justify-center">
                            {industry.icon ? (
                              <industry.icon className="w-4 h-4 text-vayva-green" />
                            ) : (
                              <Buildings className="w-4 h-4 text-vayva-green" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm group-hover:text-vayva-green">
                              {industry.displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {industry.description}
                            </p>
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-vayva-green opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categorized Industries */}
            {Object.entries(filteredCategories).map(([category, config]) => (
              <div key={category} className="border-b border-gray-100 last:border-b-0">
                <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
                      {category}
                    </h3>
                    <span className="text-xs text-gray-400">
                      ({config.industries.length})
                    </span>
                  </div>
                </div>
                
                <div className="p-2 space-y-1">
                  {config.industries.map((slug) => {
                    const industry = INDUSTRY_CONFIG[slug as IndustrySlug];
                    if (!industry) return null;
                    
                    const isSelected = value === slug;
                    
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          onChange(slug as IndustrySlug);
                          setIsOpen(false);
                          setSearchTerm("");
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-vayva-green/10 border border-vayva-green' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-vayva-green/20' : 'bg-gray-100'
                          }`}>
                            {industry.icon ? (
                              <industry.icon className={`w-4 h-4 ${
                                isSelected ? 'text-vayva-green' : 'text-gray-600'
                              }`} />
                            ) : (
                              <Buildings className={`w-4 h-4 ${
                                isSelected ? 'text-vayva-green' : 'text-gray-600'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${
                              isSelected ? 'text-vayva-green' : 'text-gray-900'
                            }`}>
                              {industry.displayName}
                              {isSelected && (
                                <span className="ml-2 text-xs bg-vayva-green/20 text-vayva-green px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {industry.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* No Results */}
            {Object.keys(filteredCategories).length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MagnifyingGlass className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No industries found</p>
                <p className="text-xs text-gray-400">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}