"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams as _useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  Link as _Link,
  Copy,
  Check,
  BarChart3,
  Calendar as _Calendar,
  AlertCircle as _AlertCircle,
  ArrowRight,
  Wallet,
  Share2,
  RefreshCw
} from "lucide-react";

interface AffiliateStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableBalance: number;
  conversionRate: number;
  avgOrderValue: number;
  referralCode: string;
  referralLink: string;
  commissionRate: number;
  commissionType: "percentage" | "fixed";
  isActive: boolean;
  joinedAt: string;
}

interface Referral {
  id: string;
  customerName: string;
  customerEmail: string;
  orderAmount: number;
  commission: number;
  status: "pending" | "confirmed" | "paid" | "rejected";
  createdAt: string;
  confirmedAt?: string;
}

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  method: string;
  createdAt: string;
  processedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default function AffiliateDashboardPage() {
  const { store } = useStore();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "payouts">("overview");
  const [copied, setCopied] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  useEffect(() => {
    if (store?.id) {
      loadData();
    }
  }, [store?.id]);

  const affiliateAddonEnabled =
    Array.isArray((store as any)?.enabledAddOns) &&
    (store as any).enabledAddOns.includes("vayva.affiliate");

  if (store && !affiliateAddonEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-3">Affiliate Program not enabled</h1>
          <p className="text-gray-600 mb-6">
            This store has not enabled the Affiliate Program add-on.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      const [statsRes, referralsRes, payoutsRes] = await Promise.all([
        apiJson<AffiliateStats>("/api/affiliate/stats"),
        apiJson<{ referrals: Referral[] }>("/api/affiliate/referrals"),
        apiJson<{ payouts: Payout[] }>("/api/affiliate/payouts"),
      ]);
      setStats(statsRes);
      setReferrals(referralsRes.referrals || []);
      setPayouts(payoutsRes.payouts || []);
    } catch (error) {
      console.error("[Affiliate Dashboard] Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestPayout = async () => {
    if (!stats?.availableBalance || stats.availableBalance < 1000) {
      return;
    }
    setIsRequestingPayout(true);
    try {
      await apiJson("/api/affiliate/payouts", {
        method: "POST",
        body: JSON.stringify({ amount: stats.availableBalance }),
      });
      loadData();
    } catch (error) {
      console.error("[Affiliate] Payout request failed:", error);
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not an affiliate yet
  if (!stats || !stats.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Join Our Affiliate Program</h1>
          <p className="text-gray-600 mb-8">
            You&apos;re not part of the affiliate program yet. Share {store?.name} with your 
            audience and earn commissions on every sale.
          </p>
          <Button size="lg" onClick={() => router.push("/affiliate/join")}>
            Become an Affiliate
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gift className="w-8 h-8 text-purple-600" />
              Affiliate Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Track your referrals and earnings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Active Affiliate
            </Badge>
          </div>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-purple-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm text-gray-600">Your Referral Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={stats.referralLink}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this link to earn {stats.commissionType === "percentage" 
                    ? `${stats.commissionRate}%` 
                    : formatCurrency(stats.commissionRate)} commission on every sale
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Shop at ${store?.name}`,
                      text: `I recommend ${store?.name}. Use my link to get started!`,
                      url: stats.referralLink,
                    });
                  }
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold">{stats.successfulReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.availableBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Request */}
        {stats.availableBalance >= 1000 && (
          <Card className="mb-8 border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Payout Available</p>
                    <p className="text-sm text-gray-600">
                      You have {formatCurrency(stats.availableBalance)} ready to withdraw
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRequestPayout}
                  disabled={isRequestingPayout}
                >
                  {isRequestingPayout ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "referrals" ? "default" : "outline"}
            onClick={() => setActiveTab("referrals")}
          >
            <Users className="w-4 h-4 mr-2" />
            Referrals
            {referrals.length > 0 && (
              <Badge variant="secondary" className="ml-2">{referrals.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "payouts" ? "default" : "outline"}
            onClick={() => setActiveTab("payouts")}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Payouts
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold">{stats.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Order Value</span>
                    <span className="font-semibold">{formatCurrency(stats.avgOrderValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission Rate</span>
                    <span className="font-semibold">
                      {stats.commissionType === "percentage" 
                        ? `${stats.commissionRate}%` 
                        : formatCurrency(stats.commissionRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold">
                      {new Date(stats.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{referral.customerName}</p>
                        <p className="text-sm text-gray-500">{referral.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">+{formatCurrency(referral.commission)}</p>
                        <Badge className={STATUS_COLORS[referral.status]}>
                          {referral.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {referrals.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No referrals yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Share your link to start earning!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "referrals" && (
          <Card>
            <CardHeader>
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>Track your referral activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.customerName}</p>
                        <p className="text-sm text-gray-500">{referral.customerEmail}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(referral.orderAmount)}</p>
                      <p className="text-sm text-emerald-600">+{formatCurrency(referral.commission)}</p>
                      <Badge className={STATUS_COLORS[referral.status]}>
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {referrals.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No referrals yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Share your referral link to start earning commissions
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "payouts" && (
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Track your commission withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(payout.amount)}</p>
                        <p className="text-sm text-gray-500">{payout.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={STATUS_COLORS[payout.status]}>
                        {payout.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {payouts.length === 0 && (
                  <div className="text-center py-12">
                    <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payouts yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Request a payout when you reach ₦1,000
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
