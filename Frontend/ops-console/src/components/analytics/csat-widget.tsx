"use client";

import React, { useState, useEffect } from "react";
import { Heart, TrendUp as TrendingUp, Warning as AlertTriangle, Smiley as Smile, SmileyMeh as Meh, SmileySad as Frown } from "@phosphor-icons/react/ssr";

export function MerchantHappinessWidget(): React.JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCSAT();
  }, []);

  const fetchCSAT = async () => {
    try {
      const res = await fetch("/api/ops/analytics/csat");
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-40">
        <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
        <div className="h-8 w-16 bg-gray-100 rounded mb-2" />
        <div className="h-2 w-full bg-gray-100 rounded" />
      </div>
    );

  if (!data) return <></>;

  const isHighGrowthStandard = data.csatScore >= data.target;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Heart size={14} className="text-red-500 fill-red-500" />
            Merchant Happiness
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-gray-900">
              {data.csatScore}%
            </span>
            <span className="text-xs font-semibold text-gray-400">CSAT</span>
          </div>
        </div>
        {isHighGrowthStandard ? (
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <TrendingUp size={12} /> TARGET MET
          </div>
        ) : (
          <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle size={12} /> BELOW TARGET
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isHighGrowthStandard ? "bg-green-500" : "bg-orange-500"}`}
          style={{ width: `${data.csatScore}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-gray-50 border border-transparent hover:border-green-200 transition-colors">
          <Smile size={16} className="mx-auto text-green-600 mb-1" />
          <div className="text-xs font-bold text-gray-900">{data.great}</div>
          <div className="text-[10px] text-gray-500">Great</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 border border-transparent hover:border-yellow-200 transition-colors">
          <Meh size={16} className="mx-auto text-yellow-600 mb-1" />
          <div className="text-xs font-bold text-gray-900">{data.okay}</div>
          <div className="text-[10px] text-gray-500">Okay</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 border border-transparent hover:border-red-200 transition-colors">
          <Frown size={16} className="mx-auto text-red-600 mb-1" />
          <div className="text-xs font-bold text-gray-900">{data.bad}</div>
          <div className="text-[10px] text-gray-500">Poor</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
        <span>Based on last {data.total} responses</span>
        <span className="italic">Goal: {data.target}%</span>
      </div>
    </div>
  );
}
