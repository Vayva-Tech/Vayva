"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@vayva/ui";
import { toast } from "sonner";
import { Users, TrendUp as TrendingUp } from "@phosphor-icons/react";
import type { PromoterSale } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

export function PromoterPerformance() {
  const [promoters, setPromoters] = useState<PromoterSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      setLoading(true);
      const eventId = "event_456";
      const data = await apiJson<{
        topPromoters: PromoterSale[];
      }>(`/api/nightlife/promoters?eventId=${eventId}`);
      
      if (data?.topPromoters) {
        setPromoters(data.topPromoters.slice(0, 5));
      }
    } catch (error: unknown) {
      console.error("[LOAD_PROMOTERS_ERROR]", error);
      toast.error("Failed to load promoter performance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Promoter Performance</h3>
          <p className="text-sm text-gray-500">Top performers tonight</p>
        </div>
      </div>

      <div className="space-y-3">
        {promoters.map((promoter, index) => (
          <div
            key={promoter.promoterId}
            className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333333]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{promoter.promoterName}</div>
                <div className="text-xs text-gray-500">
                  {promoter.guestCount} guests • ₦{promoter.barRevenue.toLocaleString()} bar
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-[#333333] rounded-full h-2 mr-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((promoter.barRevenue / 10000) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-green-400 font-medium whitespace-nowrap">
                ₦{(promoter.commissionAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
