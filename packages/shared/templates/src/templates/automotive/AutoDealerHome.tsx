import React from "react";

import { VehicleSearchWidget } from "@vayva/templates/components/automotive/VehicleSearchWidget";
import { Button } from "@vayva/ui";
// Removed missing Hero import

import { PublicStore } from "@vayva/templates/types/storefront";

export default function AutoDealerHome({
  store,
}: {
  store: PublicStore;
}): React.JSX.Element {
  return (
    <div className="bg-background/40 backdrop-blur-sm min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-32 px-6 text-center">
        <div className="absolute inset-0 bg-[url('/images/auto-hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Drive Your Dream.
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Browse thousands of certified vehicles with transparent pricing.
          </p>
        </div>
      </div>

      {/* Component: Ultra-Search Widget */}
      <div className="px-6">
        <VehicleSearchWidget />
      </div>

      {/* Featured Inventory Stub */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Featured Vehicles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-transparent rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-200" />
              <div className="p-4">
                <h3 className="font-bold text-lg">2024 Toyota Camry XSE</h3>
                <p className="text-gray-500 text-sm">2,500 miles • Hybrid</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-700">
                    ₦65,000,000
                  </span>
                  <Button
                    variant="link"
                    className="text-blue-600 font-medium text-sm hover:underline h-auto p-0"
                    aria-label="View vehicle details"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
