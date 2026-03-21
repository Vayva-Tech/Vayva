"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button, Input, Label, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { Users, TrendUp, CurrencyDollar, Copy, ArrowSquareOut, Plus, CheckCircle } from "@phosphor-icons/react";
import { formatCurrency } from "@vayva/shared";

interface Affiliate {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  customReferralLink?: string;
  commissionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  totalConversions: number;
  status: string;
  bankName?: string;
  accountNumber?: string;
}

export default function AffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({
    email: "",
    name: "",
    phone: "",
    commissionRate: 10,
    minimumPayout: 5000,
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const data = await apiJson<{ affiliates: Affiliate[] }>("api/affiliates");
      setAffiliates(data.affiliates || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to load affiliates: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiJson<{ success: boolean; affiliate: Affiliate }>(
        "/api/affiliates",
        {
          method: "POST",
          body: JSON.stringify(newAffiliate),
        }
      );

      if (response.success) {
        toast.success("Affiliate created successfully!");
        setShowAddDialog(false);
        fetchAffiliates();
        setNewAffiliate({
          email: "",
          name: "",
          phone: "",
          commissionRate: 10,
          minimumPayout: 5000,
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to create affiliate: ${err}`);
    }
  };

  const copyReferralLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const stats = {
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.status === "ACTIVE").length,
    totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
    totalReferrals: affiliates.reduce((sum, a) => sum + a.totalReferrals, 0),
  };

  // Calculate conversion rate for SummaryWidget
  const conversionRate = stats.totalReferrals > 0 
    ? ((affiliates.reduce((sum, a) => sum + a.totalConversions, 0) / stats.totalReferrals) * 100).toFixed(1)
    : "0";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Affiliate Program
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your affiliate partners and track performance •{" "}
              <span className="font-semibold text-gray-900">{stats.totalAffiliates} affiliates</span>
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)} 
            className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
          >
            <Plus size={18} weight="fill" className="mr-2" />
            Add Affiliate
          </Button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Users size={18} weight="fill" />}
            label="Total Affiliates"
            value={stats.totalAffiliates.toString()}
            trend={`${stats.activeAffiliates} active`}
            positive={true}
          />
          <SummaryWidget
            icon={<TrendUp size={18} weight="fill" />}
            label="Active Affiliates"
            value={stats.activeAffiliates.toString()}
            trend="Generating revenue"
            positive={true}
          />
          <SummaryWidget
            icon={<CurrencyDollar size={18} weight="fill" />}
            label="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            trend="All-time payouts"
            positive={true}
          />
          <SummaryWidget
            icon={<CheckCircle size={18} weight="fill" />}
            label="Conversion Rate"
            value={`${conversionRate}%`}
            trend={`${stats.totalReferrals} total referrals`}
            positive={true}
          />
        </div>
      </div>

      {/* Affiliates Table */}
      <Card className="rounded-2xl border border-gray-100 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Affiliate</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Status</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Commission</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Referral Code</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Earnings</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm">Performance</th>
                  <th className="text-right p-4 font-bold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={48} weight="fill" className="text-gray-400" />
                        <p className="font-bold text-gray-900">No affiliates yet</p>
                        <p className="text-sm text-gray-600">Click "Add Affiliate" to get started!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-900">{affiliate.name}</div>
                          <div className="text-xs text-gray-500">{affiliate.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`font-semibold ${
                          affiliate.status === "ACTIVE" 
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                          {affiliate.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {affiliate.commissionRate}%
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-50 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200">
                            {affiliate.referralCode}
                          </code>
                          <button
                            onClick={() => copyReferralLink(affiliate.referralCode)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <Copy size={16} weight="fill" className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-green-600">
                            {formatCurrency(affiliate.paidEarnings)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Pending: {formatCurrency(affiliate.pendingEarnings)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{affiliate.totalReferrals} referrals</div>
                          <div className="text-xs text-gray-500">{affiliate.totalConversions} conversions</div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl font-semibold"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Affiliate Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ">
          <Card className="w-full max-w-md rounded-2xl border border-gray-100 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Affiliate</h2>
              
              <form onSubmit={handleAddAffiliate} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={newAffiliate.name}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAffiliate.email}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                    className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={newAffiliate.phone}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, phone: e.target.value })}
                    placeholder="+234..."
                    className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Commission Rate (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      value={newAffiliate.commissionRate}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseInt(e.target.value) })}
                      className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Minimum Payout (₦)</Label>
                    <Input
                      id="minPayout"
                      type="number"
                      min="0"
                      value={newAffiliate.minimumPayout}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, minimumPayout: parseInt(e.target.value) })}
                      className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    Create Affiliate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Summary Widget Component
// ============================================================
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
