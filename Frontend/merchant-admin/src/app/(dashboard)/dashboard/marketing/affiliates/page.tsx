"use client";

import { logger, formatCurrency, formatDate } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Copy,
  Gift,
  Users,
  TrendUp as TrendingUp,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface AffiliateData {
  referralCode: string;
  stats: {
    totalEarned: number;
    totalReferrals: number;
    commissionRate: string;
  };
  history: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
  }>;
}

import { apiJson } from "@/lib/api-client-shared";

interface AffiliateResponse {
  data: AffiliateData;
}

export default function AffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AffiliateData | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiJson<AffiliateResponse>(
        "/api/marketing/affiliates",
      );
      setData(result?.data || null);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_AFFILIATES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load affiliate program data");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (data?.referralCode) {navigator?.clipboard?.writeText(data.referralCode);
      toast.success("Referral code copied!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Affiliate Program
        </h1>
        <p className="text-slate-500">
          Refer other merchants to Vayva and earn credits.
        </p>
      </div>

      {/* Hero Section */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Gift className="h-64 w-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold mb-2">
            Share the love, earn rewards
          </h2>
          <p className="text-indigo-100 mb-6 max-w-lg">
            Get {data?.stats.commissionRate} for every merchant who signs up
            with your code and processes their first payment.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-background/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="font-mono text-lg tracking-wider font-bold">
                {data?.referralCode || (
                  <span className="inline-block h-5 w-24 animate-pulse rounded bg-white/20" />
                )}
              </span>
              <Button
                onClick={copyCode}
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-background/10 h-8 w-8 rounded-full"
                title="Copy Code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={copyCode}
              className="bg-background/70 backdrop-blur-xl text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium shadow-sm border-transparent"
            >
              Copy Invitation Link
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Earned</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(data?.stats.totalEarned || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Successful Referrals
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.stats.totalReferrals || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Reward History</h3>
        </div>

        {!data?.history.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-background/40 backdrop-blur-sm text-slate-400 rounded-lg flex items-center justify-center mb-4">
              <Gift className="h-6 w-6" />
            </div>
            <p className="text-slate-500">
              No rewards earned yet. Start referring!
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-background/40 backdrop-blur-sm text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.history?.map((reward) => (
                <tr key={reward.id} className="hover:bg-white/60">
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(reward.date)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {reward.description}
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                    +{formatCurrency(reward.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
