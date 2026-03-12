"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Button, Icon, IconName, Input, cn } from "@vayva/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Warning as AlertTriangle,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { motion } from "framer-motion";

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

import { apiJson } from "@/lib/api-client-shared";

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  accent = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(
        "relative rounded-[24px] border p-6 overflow-hidden transition-shadow duration-300 group",
        accent
          ? "border-primary/20 bg-primary/[0.03] shadow-card hover:shadow-elevated"
          : "border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
          {title}
        </div>
        <div
          className={cn(
            "p-2 rounded-xl transition-colors",
            accent
              ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-inverse"
              : "bg-background/30 text-text-tertiary group-hover:bg-primary group-hover:text-text-inverse",
          )}
        >
          <Icon name={icon} size={16} />
        </div>
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">
        {value}
      </div>
      <div className="text-xs text-text-tertiary mt-1">{subtitle}</div>
      {accent && (
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      )}
    </motion.div>
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
        <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
        <span className="sr-only">Loading finance data...</span>
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
    <div className="relative space-y-8 max-w-7xl mx-auto pb-12">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {overview && (
          <>
            <p>Total sales: {formatCurrency(overview.totalSales || 0, currency)}</p>
            <p>Available balance: {formatCurrency(overview.availableBalance || 0, currency)}</p>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-text-secondary">Money</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Finance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Dialog
            open={open}
            onOpenChange={(o: boolean) => {
              setOpen(o);
              if (!o) {
                setStep("DETAILS");
                setPassword("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                disabled={!canWithdraw}
                className="rounded-full px-6 h-11 font-bold gap-2"
              >
                <Icon name="Wallet" size={16} />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Available Balance:{" "}
                  <b>
                    {formatCurrency(overview?.availableBalance || 0, currency)}
                  </b>
                </DialogDescription>
              </DialogHeader>

              {storeStatus?.kycStatus !== "VERIFIED" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>KYC Required</AlertTitle>
                  <AlertDescription>
                    You must verify your identity before withdrawing funds.
                  </AlertDescription>
                </Alert>
              )}

              {step === "DETAILS" ? (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bank">Destination Account</Label>
                    <Select
                      value={selectedBankId}
                      onValueChange={setSelectedBankId}
                    >
                      <SelectTrigger>
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
                      <p className="text-xs text-destructive">
                        No bank accounts found. Please add one in Settings.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setWithdrawAmount(e.target?.value)
                      }
                      placeholder="0.00"
                      min={1000}
                    />
                    <p className="text-xs text-text-tertiary">
                      Min withdrawal: ₦1,000
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Confirm Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target?.value)
                      }
                      placeholder="Enter your login password"
                    />
                    <p className="text-xs text-text-tertiary">
                      Security check to authorize this transfer.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  className="flex-1 h-11 font-bold rounded-xl"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                {step === "DETAILS" ? (
                  <Button
                    onClick={() => setStep("AUTH")}
                    disabled={!withdrawAmount || !selectedBankId}
                    className="flex-1 h-11 font-bold rounded-xl"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !password}
                    className="flex-1 h-11 font-bold rounded-xl"
                  >
                    {isWithdrawing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm Withdrawal
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KYC Warning */}
      {storeStatus?.kycStatus !== "VERIFIED" && (
        <div className="rounded-2xl border border-warning/20 bg-warning/10 text-warning flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              KYC verification required to withdraw funds.
            </span>
          </div>
          <Button variant="outline" size="sm" asChild className="border-warning/30 text-warning hover:bg-warning/20">
            <Link href="/dashboard/settings/kyc">Complete KYC</Link>
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sales"
          value={formatCurrency(overview?.totalSales || 0, currency)}
          subtitle="Gross sales volume"
          icon="TrendingUp"
        />
        <KpiCard
          title="Platform Fees"
          value={formatCurrency(overview?.platformFees || 0, currency)}
          subtitle="3% platform commission"
          icon="Percent"
        />
        <KpiCard
          title="Net Earnings"
          value={formatCurrency(overview?.netEarnings || 0, currency)}
          subtitle="After fees deduction"
          icon="CreditCard"
        />
        <KpiCard
          title="Available Balance"
          value={formatCurrency(overview?.availableBalance || 0, currency)}
          subtitle={`Pending: ${formatCurrency(overview?.pendingBalance || 0, currency)} (7-day hold)`}
          icon="Wallet"
          accent
        />
      </div>

      {/* Charts + Payouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Sales Chart */}
        <div className="rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-sm font-semibold text-text-primary">
              Sales Overview
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Daily revenue breakdown
            </p>
          </div>
          <div className="px-4 pb-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailySales}
                margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 11 }}
                  width={48}
                  tickFormatter={(v) => `₦${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "14px",
                    boxShadow: "0 10px 25px hsl(var(--foreground)/0.08)",
                  }}
                  itemStyle={{
                    color: "hsl(var(--text-primary))",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  labelStyle={{
                    color: "hsl(var(--text-secondary))",
                    fontSize: 11,
                    marginBottom: 6,
                  }}
                  formatter={(value: number | string | undefined) => [
                    formatCurrency(Number(value || 0), currency),
                    "Sales",
                  ]}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout History */}
        <div className="rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Payout History
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Recent withdrawal requests
            </p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {payouts.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary text-sm">
                No payouts yet
              </div>
            ) : (
              payouts.slice(0, 6).map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-background/25 border border-border/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-text-secondary truncate">
                      {payout.reference}
                    </div>
                    <div className="text-[10px] text-text-tertiary mt-0.5">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-text-primary">
                      {formatCurrency(payout.amount, currency)}
                    </div>
                    <Badge
                      variant={payout.status === "SUCCESS"
                          ? "default"
                          : (payout as any).status === "FAILED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px] mt-0.5"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bank Accounts */}
      {bankAccounts.length > 0 && (
        <div className="rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Bank Accounts
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Your linked withdrawal destinations
              </p>
            </div>
            <Link href="/dashboard/settings/payments">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8 text-xs font-bold"
              >
                <Icon name="Settings" size={14} className="mr-1.5" />
                Manage
              </Button>
            </Link>
          </div>
          <div className="px-4 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors",
                  bank.isDefault
                    ? "border-primary/20 bg-primary/[0.02]"
                    : "border-border/40 bg-background/20",
                )}
              >
                <div className="p-2 rounded-xl bg-background/30 text-text-tertiary">
                  <Icon name="Building" size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary truncate">
                    {bank.bankName}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {bank.accountNumber} · {bank.accountName}
                  </div>
                </div>
                {bank.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
