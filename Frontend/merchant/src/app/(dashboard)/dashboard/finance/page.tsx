// @ts-nocheck
"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Button, Icon, IconName, Input, cn, Card } from "@vayva/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Wallet,
  TrendUp,
  DollarSign,
  CreditCard,
  Building,
  Clock,
  Download,
  Plus,
  Trash,
  CheckCircle,
  Warning,
  ArrowRight
} from "@phosphor-icons/react/ssr";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface FinanceOverview {
  totalSales: number;
  platformFees: number;
  netEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  currency: string;
  dailySales?: { name: string; sales: number }[];
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  destination?: { bankName?: string; accountNumber?: string };
  reference: string;
  createdAt: string;
}

interface BankBeneficiary {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface StoreStatus {
  kycStatus: "NONE" | "PENDING" | "VERIFIED" | "FAILED";
}

// Balance Overview Card Component
function BalanceOverviewCard({
  availableBalance,
  pendingBalance,
  currency,
  onWithdraw,
}: {
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  onWithdraw: () => void;
}) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Available Balance
          </p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            {formatCurrency(availableBalance, currency)}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
            <Clock size={14} />
            Pending: {formatCurrency(pendingBalance, currency)}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onWithdraw} className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 h-12 font-medium">
            Withdraw Funds
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <Button variant="outline" className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-6 h-12 font-medium">
            View Transactions
          </Button>
        </div>
      </div>
    </Card>
  );
}

// KPI Card Component
function FinanceKpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              <TrendUp size={14} className="mr-1" />
              {Math.abs(trend.value)}% from last period
            </div>
          )}
          {!trend && (
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
          <Icon name={icon} size={20} />
        </div>
      </div>
    </Card>
  );
}

interface FinanceStatsResponse {
  totalSales: number;
  platformFees: number;
  netEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  currency: string;
  dailySales?: { name: string; sales: number }[];
}

interface WithdrawResponse {
  success: boolean;
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinanceOverview | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankBeneficiary[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"DETAILS" | "AUTH">("DETAILS");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, payoutsData, banksData, statusData] = await Promise.all(
        [
          apiJson<FinanceStatsResponse>("/api/finance/stats"),
          apiJson<Payout[]>("/api/finance/payouts"),
          apiJson<BankBeneficiary[]>("/api/finance/banks"),
          apiJson<StoreStatus>("/api/merchant/store/status"),
        ],
      );

      setStats(statsData);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
      setBankAccounts(Array.isArray(banksData) ? banksData : []);
      setStoreStatus(statusData);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load finance data";
      logger.error("[FETCH_FINANCE_DATA_ERROR]", {
        error: message,
        app: "merchant",
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedBankId || !withdrawAmount || !password) return;

    setIsWithdrawing(true);
    try {
      const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);
      await apiJson<WithdrawResponse>("/api/finance/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          bankDetails: {
            bankCode: "000",
            accountNumber: selectedBank?.accountNumber,
          },
          password,
        }),
      });

      toast.success("Payout requested successfully");
      setOpen(false);
      setWithdrawAmount("");
      setPassword("");
      setStep("DETAILS");
      void fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error("[WITHDRAW_ERROR]", { error: message, app: "merchant" });
      toast.error("Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Loading finance data...</span>
        </div>
      </div>
    );
  }

  const overview = stats;
  const beneficiaries = bankAccounts;
  const dailySales = stats?.dailySales || [];
  const currency = overview?.currency || "NGN";
  const canWithdraw =
    overview &&
    overview.availableBalance > 0 &&
    storeStatus?.kycStatus === "VERIFIED";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Finance Hub</h1>
        <p className="text-sm text-gray-500">Manage your earnings, withdrawals, and financial analytics</p>
      </div>

      {/* Balance Overview Card */}
      {overview && (
        <BalanceOverviewCard
          availableBalance={overview.availableBalance}
          pendingBalance={overview.pendingBalance}
          currency={currency}
          onWithdraw={() => setOpen(true)}
        />
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceKpiCard
          title="Total Sales"
          value={formatCurrency(overview?.totalSales || 0, currency)}
          subtitle="Gross sales volume"
          icon="TrendUp"
          trend={{ value: 12.5, positive: true }}
        />
        <FinanceKpiCard
          title="Platform Fees"
          value={formatCurrency(overview?.platformFees || 0, currency)}
          subtitle="3% platform commission"
          icon="CreditCard"
        />
        <FinanceKpiCard
          title="Net Earnings"
          value={formatCurrency(overview?.netEarnings || 0, currency)}
          subtitle="After fees deduction"
          icon="DollarSign"
          trend={{ value: 8.2, positive: true }}
        />
        <FinanceKpiCard
          title="This Month"
          value={formatCurrency(overview?.availableBalance || 0, currency)}
          subtitle="Available for withdrawal"
          icon="Wallet"
        />
      </div>

      {/* Two Column Layout: Chart + Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Sales Overview</h3>
              <p className="text-sm text-gray-500 mt-1">Daily revenue breakdown (Last 7 days)</p>
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(v) => `₦${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#1F2937", fontSize: 13, fontWeight: 600 }}
                  labelStyle={{ color: "#6B7280", fontSize: 12, marginBottom: 6 }}
                  formatter={(value: number | string | undefined) => [
                    formatCurrency(Number(value || 0), currency),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout History - 1 column */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Payout History</h3>
              <p className="text-sm text-gray-500 mt-1">Recent withdrawals</p>
            </div>
            <Link href="/dashboard/finance/payouts">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Wallet size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No payouts yet</p>
              </div>
            ) : (
              payouts.slice(0, 5).map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatCurrency(payout.amount, currency)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={payout.status === "SUCCESS" ? "success" : payout.status === "FAILED" ? "error" : "warning"}
                    className="text-xs"
                  >
                    {payout.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bank Accounts Section */}
      {bankAccounts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Bank Accounts</h3>
              <p className="text-sm text-gray-500 mt-1">Your linked withdrawal destinations</p>
            </div>
            <Link href="/dashboard/settings/payments">
              <Button variant="outline" size="sm" className="border-gray-200">
                <Plus size={16} className="mr-2" />
                Add Account
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Building size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{bank.bankName}</p>
                      <p className="text-xs text-gray-500">•••• {bank.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                  {bank.isDefault && (
                    <Badge variant="info" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{bank.accountName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KYC Warning */}
      {storeStatus?.kycStatus !== "VERIFIED" && (
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Warning size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">KYC Verification Required</h3>
              <p className="text-sm text-gray-600 mb-4">
                You must verify your identity before withdrawing funds. This is a one-time process.
              </p>
              <Link href="/dashboard/settings/kyc">
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 h-10 font-medium">
                  Complete KYC Verification
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Withdraw Funds</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Select your destination bank and enter the amount to withdraw
            </DialogDescription>
          </DialogHeader>

          {step === "DETAILS" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bank" className="text-sm font-medium text-gray-700">
                  Destination Account
                </Label>
                <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaries.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {beneficiaries.length === 0 && (
                  <p className="text-xs text-red-600">No bank accounts found. Please add one in Settings.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWithdrawAmount(e.target?.value)
                  }
                  placeholder="0.00"
                  min={1000}
                  className="h-12"
                />
                <p className="text-xs text-gray-500">Minimum withdrawal: ₦1,000</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target?.value)
                  }
                  placeholder="Enter your password"
                  className="h-12"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step === "AUTH") {
                  setStep("DETAILS");
                } else {
                  setOpen(false);
                }
              }}
              className="border-gray-200"
            >
              {step === "AUTH" ? "Back" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || (!selectedBankId && step === "DETAILS")}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 font-medium"
            >
              {isWithdrawing ? "Processing..." : step === "DETAILS" ? "Continue" : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
