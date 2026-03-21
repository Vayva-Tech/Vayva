// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { Button } from "@vayva/ui";
import { 
  MagnifyingGlass as Search, 
  CheckCircle, 
  Package, 
  UtensilsCrossed, 
  Scissors,
  House,
  FileText,
  Car,
  Briefcase,
  GraduationCap,
  Heart,
  Ticket,
  Sparkle,
  ChefHat,
  ShoppingCart,
  BookOpen,
  Stethoscope,
  Building2,
  Users,
  Newspaper,
  Folder,
  Stack,
  Storefront,
  Dumbbell,
  Bot
} from "@phosphor-icons/react/ssr";
import { 
  INDUSTRY_OVERRIDES, 
  getAllIndustrySlugs,
  getIndustryDisplayNames
} from "@/config/industry-archetypes";
import { 
  INDUSTRY_DESIGN_CATEGORIES,
  DESIGN_CATEGORY_LABELS
} from "@/config/industry-design-categories";
import { applyDesignCategory } from "@/lib/theme-utils";

// Industry icon mapping
const INDUSTRY_ICONS: Record<string, React.ComponentType<any>> = {
  retail: Package,
  fashion: Sparkle,
  electronics: ShoppingCart,
  beauty: Sparkle,
  grocery: ShoppingCart,
  b2b: Building2,
  wholesale: ShoppingCart,
  one_product: Package,
  saas: Stack,
  marketplace: Storefront,
  food: UtensilsCrossed,
  restaurant: ChefHat,
  catering: ChefHat,
  services: Briefcase,
  salon: Scissors,
  spa: Sparkle,
  real_estate: House,
  automotive: Car,
  travel_hospitality: House,
  hotel: House,
  fitness: Dumbbell,
  healthcare: Stethoscope,
  legal: Briefcase,
  digital: FileText,
  events: Ticket,
  blog_media: Newspaper,
  creative_portfolio: Folder,
  education: GraduationCap,
  nonprofit: Heart,
  nightlife: Ticket,
  jobs: Users,
};

export default function IndustryStep() {
  const { state, updateData, nextStep, prevStep, isSaving } = useOnboarding();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(
    state.business?.industrySlug || null
  );

  // Get all industries sorted by priority
  const industries = getAllIndustrySlugs()
    .map(slug => ({
      slug,
      config: INDUSTRY_OVERRIDES[slug],
      displayName: INDUSTRY_OVERRIDES[slug]?.displayName || slug,
      description: INDUSTRY_OVERRIDES[slug]?.description || "",
      designCategory: INDUSTRY_DESIGN_CATEGORIES[slug],
    }))
    .filter(industry => 
      industry.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Prioritize common industries
      const priority = [
        "retail", "fashion", "restaurant", "services", 
        "food", "beauty", "electronics", "grocery"
      ];
      const aIdx = priority.indexOf(a.slug);
      const bIdx = priority.indexOf(b.slug);
      
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      
      return a.displayName.localeCompare(b.displayName);
    });

  const handleContinue = async () => {
    if (!selectedIndustry) return;
    
    try {
      // Save industry selection
      const industryData = {
        business: {
          ...state.business,
          industrySlug: selectedIndustry,
        }
      };
      
      updateData(industryData);
      
      // Apply design category immediately
      const designCategory = INDUSTRY_DESIGN_CATEGORIES[selectedIndustry];
      if (designCategory) {
        applyDesignCategory(designCategory);
      }
      
      // Proceed to next step
      await nextStep(industryData);
    } catch (error) {
      console.error("Failed to save industry selection:", error);
    }
  };

  const getDesignCategoryColor = (category: string) => {
    switch (category) {
      case "glass": return "from-pink-100 to-red-100";
      case "bold": return "from-orange-100 to-yellow-100";
      case "dark": return "from-gray-800 to-gray-900 text-white";
      case "natural": return "from-amber-50 to-yellow-50";
      default: return "from-blue-50 to-green-50";
    }
  };

  const getDesignCategoryBorder = (category: string) => {
    switch (category) {
      case "glass": return "border-pink-200";
      case "bold": return "border-orange-300";
      case "dark": return "border-gray-700";
      case "natural": return "border-amber-200";
      default: return "border-blue-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          What type of business do you run?
        </h1>
        <p className="text-gray-500 text-lg">
          We'll customize your dashboard, features, and design to match your industry
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-text-tertiary"
          />
        </div>
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {industries.map((industry) => {
          const IconComponent = INDUSTRY_ICONS[industry.slug] || Package;
          const isSelected = selectedIndustry === industry.slug;
          
          return (
            <button
              key={industry.slug}
              onClick={() => setSelectedIndustry(industry.slug)}
              className={`
                text-left p-5 rounded-2xl border-2 transition-all duration-200
                ${isSelected 
                  ? `border-green-500 bg-green-500/5 ring-2 ring-green-500 ${getDesignCategoryBorder(industry.designCategory)}` 
                  : "border-gray-100 hover:border-green-500/50 bg-white"
                }
                ${getDesignCategoryColor(industry.designCategory)}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isSelected ? "bg-green-500 text-white" : "bg-white-subtle text-gray-500"}
                  `}>
                    <IconComponent size={24} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {industry.displayName}
                    </h3>
                    <span className="text-xs text-gray-400 capitalize">
                      {DESIGN_CATEGORY_LABELS[industry.designCategory as keyof typeof DESIGN_CATEGORY_LABELS].split(" ")[0]}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle 
                    size={20} 
                    className="text-green-500 flex-shrink-0 mt-1" 
                    weight="fill"
                  />
                )}
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2">
                {industry.description}
              </p>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400">
                  {DESIGN_CATEGORY_LABELS[industry.designCategory as keyof typeof DESIGN_CATEGORY_LABELS]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSaving}
          className="px-6"
        >
          Back
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={!selectedIndustry || isSaving}
          className="px-8"
          data-action="continue"
        >
          {isSaving ? (
            <>
              <Bot className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}