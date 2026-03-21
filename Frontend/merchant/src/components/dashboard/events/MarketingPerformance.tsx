// @ts-nocheck
"use client";

import React from "react";
import { Mail, Share2, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@vayva/ui";

interface MarketingPerformanceProps {
  data?: {
    email?: {
      campaigns: any[];
      summary: {
        sent: number;
        openRate: number;
        clickRate: number;
        revenue: number;
      };
    };
    socialMedia?: {
      campaigns: any[];
      summary: {
        impressions: number;
        clicks: number;
        adSpend: number;
        revenue: number;
      };
    };
    partnerPromotions?: {
      campaigns: any[];
      summary: {
        referrals: number;
        revenue: number;
      };
    };
    roiSummary?: {
      totalAdSpend: number;
      totalRevenue: number;
      roi: number;
      profitable: boolean;
    };
  };
}

export function MarketingPerformance({ data }: MarketingPerformanceProps) {
  if (!data) return null;

  const { email, socialMedia, partnerPromotions, roiSummary } = data;

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Marketing Performance
      </h3>

      {/* Campaigns */}
      <div className="space-y-3 mb-4">
        {email && (
          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-blue-900 uppercase">Email Campaign</p>
            </div>
            <p className="text-sm font-bold text-blue-900">Sent: {email.summary.sent.toLocaleString()}</p>
            <p className="text-xs text-blue-700">Open: {email.summary.openRate.toFixed(1)}% • Conv: {email.summary.conversionRate?.toFixed(1) || 0}%</p>
            <p className="text-sm font-black text-blue-900 mt-1">{formatCurrency(email.summary.revenue)}</p>
          </div>
        )}

        {socialMedia && (
          <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-bold text-purple-900 uppercase">Social Media Ads</p>
            </div>
            <p className="text-sm font-bold text-purple-900">Impressions: {(socialMedia.summary.impressions / 1000).toFixed(0)}K</p>
            <p className="text-xs text-purple-700">Clicks: {socialMedia.summary.clicks.toLocaleString()}</p>
            <p className="text-sm font-black text-purple-900 mt-1">{formatCurrency(socialMedia.summary.revenue)}</p>
          </div>
        )}

        {partnerPromotions && (
          <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <p className="text-xs font-bold text-green-900 uppercase">Partner Promotion</p>
            </div>
            <p className="text-sm font-bold text-green-900">Referrals: {partnerPromotions.summary.referrals}</p>
            <p className="text-sm font-black text-green-900 mt-1">{formatCurrency(partnerPromotions.summary.revenue)}</p>
          </div>
        )}
      </div>

      {/* ROI Summary */}
      {roiSummary && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-black rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">ROI Summary</p>
            <span className={`text-xs font-black ${roiSummary.profitable ? "text-green-700" : "text-red-700"}`}>
              {roiSummary.profitable ? "✓ Profitable" : "✗ Loss"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-600">Ad Spend</p>
              <p className="text-lg font-black text-gray-900">{formatCurrency(roiSummary.totalAdSpend)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Revenue</p>
              <p className="text-lg font-black text-pink-600">{formatCurrency(roiSummary.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">ROI</p>
              <p className={`text-lg font-black ${roiSummary.roi > 0 ? "text-green-700" : "text-red-700"}`}>
                {roiSummary.roi}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
