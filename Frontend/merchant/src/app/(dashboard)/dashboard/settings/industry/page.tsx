"use client";

import { useState } from "react";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { logger } from "@vayva/shared";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const INDUSTRY_ICON: Record<IndustrySlug, string> = {
  retail: "Store",
  fashion: "Shirt",
  electronics: "Laptop",
  beauty: "Sparkles",
  grocery: "ShoppingCart",
  food: "UtensilsCrossed",
  restaurant: "Utensils",
  catering: "Truck",
  services: "Scissors",
  salon: "Scissors",
  spa: "Sparkles",
  digital: "FileText",
  events: "Ticket",
  b2b: "Warehouse",
  wholesale: "Boxes",
  real_estate: "Home",
  automotive: "Car",
  travel_hospitality: "Bed",
  hotel: "Building2",
  blog_media: "Newspaper",
  creative_portfolio: "Palette",
  nonprofit: "Heart",
  education: "GraduationCap",
  marketplace: "Store",
  one_product: "Package",
  nightlife: "PartyPopper",
  saas: "Cloud",
  fitness: "Barbell",
  healthcare: "HeartPulse",
  legal: "Scale",
  jobs: "Briefcase",
};

// Groupings for UI
const INDUSTRY_GROUPS = {
  "Commerce & Retail": [
    "retail",
    "fashion",
    "electronics",
    "beauty",
    "grocery",
    "one_product",
    "b2b",
    "marketplace",
  ],
  "Food & Services": ["food", "services"],
  "Education & Digital": ["education", "events", "digital"],
  "Entertainment & Hospitality": ["nightlife", "travel_hospitality"],
  Specialized: [
    "real_estate",
    "automotive",
    "blog_media",
    "creative_portfolio",
    "nonprofit",
  ],
};

import { apiJson } from "@/lib/api-client-shared";

export default function IndustrySettingsPage() {
  const { merchant } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState<IndustrySlug | null>(
    (merchant as { industrySlug?: IndustrySlug } | undefined)?.industrySlug || "retail",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedSlug) return;
    setIsLoading(true);

    try {
      await apiJson<{ success: boolean }>("/api/settings/industry", {
        method: "POST",
        body: JSON.stringify({ industrySlug: selectedSlug }),
      });

      toast.success("Industry updated successfully");

      // Force reload to update sidebar and app context
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_INDUSTRY_ERROR]", {
        error: _errMsg,
        slug: selectedSlug,
        app: "merchant",
      });
      toast.error("Failed to update industry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <Breadcrumbs />
      <div className="flex items-center gap-4 mb-6">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Industry
          </h1>
          <p className="text-gray-500">
            Select your business industry for tailored features.
          </p>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Select Your Industry</h1>
          <p className="text-gray-500">
            This will customize your dashboard, sidebar, and product forms to
            match your business needs.
          </p>
        </div>
      </div>

      {Object.entries(INDUSTRY_GROUPS).map(([groupTitle, slugs]) => (
        <div key={groupTitle} className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-100 pb-2">
            {groupTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slugs.map((slug) => {
              // Safe access to config
              const config = INDUSTRY_CONFIG[slug as IndustrySlug];
              if (!config) return null;

              const isSelected = selectedSlug === slug;
              return (
                <div
                  key={slug}
                  onClick={() => setSelectedSlug(slug as IndustrySlug)}
                  className={`
                    cursor-pointer rounded-xl border-2 p-6 transition-all relative overflow-hidden group
                    ${
                      isSelected
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-200 hover:border-gray-200 hover:bg-white/80"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${isSelected ? "bg-white  border border-gray-200" : "bg-white"}`}
                    >
                      <Icon
                        name={
                          INDUSTRY_ICON[slug as IndustrySlug] || "Briefcase"
                        }
                        size={20}
                        className="text-gray-900"
                      />
                    </div>
                    {isSelected && (
                      <div className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                        SELECTED
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1">
                    {config.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {config.description ||
                      `Optimized for ${config?.displayName?.toLowerCase()} businesses`}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {config.features?.bookings && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        Bookings
                      </span>
                    )}
                    {config.features?.delivery && (
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Delivery
                      </span>
                    )}
                    {config.features?.inventory && (
                      <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                        Inventory
                      </span>
                    )}
                    {config.features?.content && (
                      <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
                        Content
                      </span>
                    )}
                    {config.features?.reservations && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        Reservations
                      </span>
                    )}
                    {config.features?.tickets && (
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Tickets
                      </span>
                    )}
                    {config.features?.quotes && (
                      <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                        Quotes
                      </span>
                    )}
                    {config.features?.donations && (
                      <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        Donations
                      </span>
                    )}
                    {config.features?.enrollments && (
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                        Enrollments
                      </span>
                    )}
                    {config.features?.viewings && (
                      <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                        Viewings
                      </span>
                    )}
                    {config.features?.testDrives && (
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        Test Drives
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end p-4 bg-white  border-t border-gray-100 fixed bottom-0 left-0 right-0 md:bg-transparent md:border-none md:relative md:p-0 z-10">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={!selectedSlug}
          size="lg"
          className="w-full md:w-auto"
        >
          Save & Apply Changes
        </Button>
      </div>
    </div>
  );
}
