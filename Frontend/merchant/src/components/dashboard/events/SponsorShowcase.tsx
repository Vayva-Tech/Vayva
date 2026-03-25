"use client";

import React from "react";
import { Award, Trophy, Medal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SponsorShowcaseProps {
  data?: {
    totalSponsors: number;
    totalValue: number;
    byTier?: {
      platinum: any[];
      gold: any[];
      bronze: any[];
    };
  };
}

const TIER_ICONS = {
  platinum: Award,
  gold: Trophy,
  bronze: Medal,
};

const TIER_COLORS = {
  platinum: "from-gray-400 to-gray-300",
  gold: "from-yellow-400 to-yellow-300",
  bronze: "from-amber-600 to-amber-500",
};

export function SponsorShowcase({ data }: SponsorShowcaseProps) {
  if (!data) return null;

  const { totalSponsors, totalValue, byTier } = data;

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Sponsor Showcase
      </h3>

      {/* Total */}
      <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-black rounded-lg text-center">
        <p className="text-2xl font-black text-pink-600">{formatCurrency(totalValue)}</p>
        <p className="text-xs font-bold text-gray-700 mt-1">Total Sponsorship • {totalSponsors} Sponsors</p>
      </div>

      {/* By Tier */}
      <div className="space-y-3">
        {(byTier?.platinum?.length ?? 0) > 0 && (
          <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-black text-gray-900 uppercase">Platinum</p>
            </div>
            {byTier?.platinum?.map((sponsor) => (
              <div key={sponsor.id}>
                <p className="font-bold text-gray-900">{sponsor.name}</p>
                <p className="text-xs text-gray-600">Booth #{sponsor.boothNumber || "N/A"}</p>
              </div>
            ))}
          </div>
        )}

        {(byTier?.gold?.length ?? 0) > 0 && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-black text-yellow-900 uppercase">Gold</p>
            </div>
            {byTier?.gold?.map((sponsor) => (
              <div key={sponsor.id}>
                <p className="font-bold text-gray-900">{sponsor.name}</p>
                <p className="text-xs text-gray-600">Booth #{sponsor.boothNumber || "N/A"}</p>
              </div>
            ))}
          </div>
        )}

        {(byTier?.bronze?.length ?? 0) > 0 && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Medal className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-black text-amber-900 uppercase">Bronze</p>
            </div>
            {byTier?.bronze?.map((sponsor) => (
              <div key={sponsor.id}>
                <p className="font-bold text-gray-900">{sponsor.name}</p>
                <p className="text-xs text-gray-600">Booth #{sponsor.boothNumber || "N/A"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
