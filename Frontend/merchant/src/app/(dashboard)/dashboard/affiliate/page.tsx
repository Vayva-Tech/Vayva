"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@vayva/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Wallet,
  Users,
  TrendingUp,
  Link,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MousePointer,
  ArrowUpRight,
  Truck,
  Map,
  Package,
  ShoppingBag,
  ArrowRight,
  Smartphone,
  Phone,
  X,
  Calendar,
  Mic,
  Speaker,
  MessageSquare,
  CreditCard,
  Store,
  Wifi,
  Zap,
  FileSpreadsheet,
  Upload,
  Building2,
  Gift,
  Boxes,
  Repeat,
  Key,
} from "lucide-react";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";

interface AffiliateStats {
  todayClicks: number;
  monthClicks: number;
  conversionRate: number;
  averageOrder: number;
  totalEarnings: number;
  pendingEarnings: number;
  totalReferrals: number;
}

interface Referral {
  id: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  status: "pending" | "confirmed" | "rejected" | "paid";
  referredAt: string;
  confirmedAt?: string;
  customerName?: string;
}

interface Payout {
  id: string;
  amount: number;
  status: "processing" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  method: "bank_transfer" | "wallet";
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
  paid: { color: "bg-green-100 text-green-800", label: "Paid" },
};

export default function AffiliateDashboardPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ success: boolean; stats: AffiliateStats; referrals: Referral[]; payouts: Payout[]; affiliate?: { code: string } }>("/api/affiliate/dashboard");
      if (response.success) {
        setStats(response.stats);
        setReferrals(response.referrals || []);
        setPayouts(response.payouts || []);
        setAffiliateCode(response.affiliate?.code || "");
      }
    } catch (error) {
      logger.error("[Affiliate] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const getAffiliateLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/ref/${affiliateCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getAffiliateLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = async () => {
    try {
      const res = await apiJson<{ success: boolean }>("/api/affiliate/payout", {
        method: "POST",
        body: JSON.stringify({ method: "wallet" }),
      });
      if (res.success) {
        loadData();
      }
    } catch (error) {
      logger.error("[Affiliate] Payout failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track your referrals, earnings, and performance
        </p>
      </div>

      {/* Affiliate Link Card */}
      <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Your Affiliate Link</h2>
            <p className="text-green-100 text-sm">
              Share this link to earn commission on every sale
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <code className="px-3 py-2 text-sm font-mono">{getAffiliateLink()}</code>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleCopyLink}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.pendingEarnings)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Today's Clicks</p>
              <p className="font-semibold">{stats?.todayClicks || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Monthly Clicks</p>
              <p className="font-semibold">{stats?.monthClicks || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Avg. Order</p>
              <p className="font-semibold">{formatCurrency(stats?.averageOrder || 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Commission</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">#{ref.orderId.slice(-6)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(ref.orderAmount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        +{formatCurrency(ref.commission)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_CONFIG[ref.status].color}>
                          {STATUS_CONFIG[ref.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(ref.referredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {referrals.length === 0 && (
              <div className="text-center py-12">
                <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No referrals yet. Share your link to start earning!</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Payout History</h3>
              <Button
                onClick={handleRequestPayout}
                disabled={!stats || stats.pendingEarnings < 500000}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {payout.method === "wallet" ? "Wallet" : "Bank Transfer"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payout.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {payouts.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts yet.</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
