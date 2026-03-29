"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Button, Card, Icon } from "@vayva/ui";

import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

type ReferralReward = {
  id: string;
  amount: number;
  createdAt: string;
  description?: string | null;
};

type ReferralsResponse = {
  code: string;
  stats: { total: number; conversions: number };
  pendingDiscount: number;
  rewards: ReferralReward[];
};

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const rewards: ReferralReward[] = data?.rewards ?? [];

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        setLoading(true);
        const d = await apiJson<ReferralsResponse>("/referrals");
        setData(d);
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[LOAD_REFERRALS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load referrals");
      } finally {
        setLoading(false);
      }
    };
    void loadReferrals();
  }, []);

  const copyCode = () => {
    if (!data?.code) return;
    navigator.clipboard?.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="p-8" aria-live="polite" role="status">
        <Icon name="Loader" className="animate-spin" />
        <span className="sr-only">Loading referral data...</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-green-600 to-violet-700 p-8 rounded-2xl text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Refer & Earn ₦1,000</h1>
          <p className="text-green-100 max-w-md">
            Refer another business to Vayva. Once they subscribe, you get ₦1,000
            off your next bill. Capped at 6 referrals per month.
          </p>
        </div>
        <div className="bg-white  p-6 rounded-2xl border border-white/20 relative z-10">
          <p className="text-xs uppercase tracking-widest text-green-200 font-bold mb-3">
            Your Referral Code
          </p>
          <div className="flex items-center gap-3">
            <code className="text-2xl font-mono font-bold">{data?.code}</code>
            <Button
              onClick={copyCode}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <Icon name={copied ? "Check" : "Copy"} size={20} />
            </Button>
          </div>
        </div>
        <Icon
          name="Users"
          className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="UserPlus" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
            Total Referrals
          </p>
          <h2 className="text-3xl font-bold mt-1">{data?.stats.total || 0}</h2>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="CreditCard" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
            Converted
          </p>
          <h2 className="text-3xl font-bold mt-1">
            {data?.stats.conversions || 0}
          </h2>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="Gift" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
            Next Discount
          </p>
          <h2 className="text-3xl font-bold mt-1">
            ₦{(data?.pendingDiscount ?? 0).toLocaleString()}
          </h2>
        </Card>
      </div>

      <div className="bg-white  rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Reward History</h3>
          <Icon name="History" className="text-gray-500" />
        </div>
        {rewards.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {rewards.map((reward: ReferralReward) => (
              <div
                key={reward.id}
                className="p-6 flex items-center justify-between hover:bg-white transition-colors"
              >
                <div>
                  <p className="font-bold text-gray-900">
                    {reward.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-green-600 font-bold">
                  +₦{reward?.amount?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No rewards earned yet. Share your code to start saving!</p>
          </div>
        )}
      </div>
    </div>
  );
}
