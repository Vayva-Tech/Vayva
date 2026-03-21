// @ts-nocheck
"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Wallet, CurrencyDollar as DollarSign, ClockCounterClockwise, CheckCircle, AlertCircle } from "@phosphor-icons/react";
import { Button, Input, Select } from "@vayva/ui";
import { Payout, BankAccount, PayoutResponse } from "@/types/finance";
import { apiJson } from "@/lib/api-client-shared";
import { PaymentService } from "@/services/payment";

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    void fetchPayouts();
    void fetchAccounts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await apiJson<PayoutResponse>("/api/wallet/payouts");
      setPayouts(data?.payouts || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_PAYOUTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load payout history");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const data = await apiJson<BankAccount[]>("/api/wallet/payout-accounts");
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_ACCOUNTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load payout accounts");
    } finally {
      setAccountsLoading(false);
    }
  };

  // Calculate metrics
  const totalPayouts = payouts.length;
  const pending = payouts.filter(p => p.status === 'pending').length;
  const completed = payouts.filter(p => p.status === 'completed').length;
  const failed = payouts.filter(p => p.status === 'failed').length;
  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <span className="sr-only">Loading payouts...</span>
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">View your withdrawal history and request new payouts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          Withdraw Funds
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<Wallet size={18} />}
          label="Total Payouts"
          value={String(totalPayouts)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Pending"
          value={String(pending)}
          trend="processing"
          positive={pending === 0}
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Completed"
          value={String(completed)}
          trend="successful"
          positive
        />
        <SummaryWidget
          icon={<AlertCircle size={18} />}
          label="Failed"
          value={String(failed)}
          trend="needs attention"
          positive={failed === 0}
        />
        <SummaryWidget
          icon={<DollarSign size={18} />}
          label="Total Amount"
          value={formatCurrency(totalAmount)}
          trend="withdrawn"
          positive
        />
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {payouts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Wallet size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No payouts yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Initiate your first withdrawal to get started.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Withdraw Funds
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{payout.reference}</code>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(payout.amount, payout.currency)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {payout.bankName || payout.accountNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          payout.status === 'completed'
                            ? "bg-green-50 text-green-600"
                            : payout.status === 'pending'
                            ? "bg-orange-50 text-orange-600"
                            : payout.status === 'failed'
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-500/20",
    PROCESSING: "bg-blue-50 text-blue-600 border-blue-500/20",
    SUCCESS: "bg-green-50 text-green-600 border-green-500/20",
    FAILED: "bg-red-500 text-red-500 border-red-500/20",
  };

  const icons: Record<string, React.ElementType> = {
    SUCCESS: CheckCircle,
    FAILED: AlertCircle,
  };

  const StatusIcon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-50 text-gray-700 border-gray-100"}`}
    >
      {StatusIcon && <StatusIcon className="h-3 w-3" />}
      {status}
    </span>
  );
}

function WithdrawalModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  accountsLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: BankAccount[];
  accountsLoading: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [accountId, setAccountId] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [instantWithdrawal, setInstantWithdrawal] = useState(true);

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      const preferred = accounts.find((a) => a.isDefault) || accounts[0];
      setAccountId(preferred.id);
    }
  }, [accounts, accountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!accountId) {
        toast.error("Select a payout account first");
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      // For instant withdrawal, use direct API call
      if (instantWithdrawal) {
        const response = await fetch("/api/finance/payouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parsedAmount,
            currency: "NGN",
            bankDetails: {
              recipientCode: accounts.find(a => a.id === accountId)?.recipientCode,
              bankName: accounts.find(a => a.id === accountId)?.bankName,
              accountNumber: accounts.find(a => a.id === accountId)?.accountNumber,
              accountName: accounts.find(a => a.id === accountId)?.accountName,
            },
            instant: true,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Instant withdrawal failed");
        }

        toast.success(`₦${parsedAmount.toLocaleString()} transferred instantly to ${accounts.find(a => a.id === accountId)?.bankName}!`);
        onSuccess();
        return;
      }

      // Standard withdrawal with OTP
      const amountKobo = Math.round(parsedAmount * 100);

      const res = await PaymentService.initiateWithdrawal({
        amountKobo,
        pin,
        bankAccountId: accountId,
      });

      if (!res || !res.withdrawalId) {
        throw new Error("Failed to initiate withdrawal");
      }

      setWithdrawalId(res.withdrawalId);
      setShowOtpDialog(true);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : null;
      const message = _e?.message || "Withdrawal failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center bg-white px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Request Withdrawal</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 h-8 w-8 rounded-full"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true" className="text-xl">
              ×
            </span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payout Account
            </label>
            {accountsLoading ? (
              <div className="text-sm text-gray-500">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-500/20 rounded-lg p-3">
                No payout accounts found. Add one in Settings → Payments.
              </div>
            ) : (
              <Select
                title="Payout Account"
                required
                value={accountId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setAccountId(e.target?.value)
                }
                className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none"
              >
                <option value="">Select bank account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} •••• {acc?.accountNumber?.slice(-4)} (
                    {acc.accountName})
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="space-y-4">
            {/* Instant Withdrawal Toggle */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-900">⚡ Instant Transfer</span>
                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-black uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Funds arrive in your bank account within 30 seconds via Paystack
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantWithdrawal}
                    onChange={(e) => setInstantWithdrawal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ₦
                </span>
                <Input type="number"
                  required
                  min="1000"
                  step="0.01"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(e.target?.value)
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum withdrawal: ₦1,000.00
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction PIN
            </label>
            <Input type="password"
              required
              maxLength={6}
              value={pin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPin(e.target?.value)
              }
              className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
              placeholder="••••"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 text-gray-700 bg-white border-gray-200 hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 font-medium text-sm ${
                instantWithdrawal
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              disabled={loading || !accountId || !amount}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                  Processing...
                </>
              ) : instantWithdrawal ? (
                <>
                  ⚡ Transfer Instantly
                </>
              ) : (
                "Withdraw (Standard)"
              )}
            </Button>
          </div>
        </form>

        {showOtpDialog && withdrawalId && (
          <StepUpDialog
            isOpen={showOtpDialog}
            onClose={() => {
              setShowOtpDialog(false);
              setWithdrawalId(null);
            }}
            onVerify={async (otpCode) => {
              if (!withdrawalId) {
                throw new Error("Missing withdrawal reference");
              }
              const res = await PaymentService.confirmWithdrawal(
                withdrawalId,
                otpCode,
              );

              if (res?.error) {
                throw new Error(res.error);
              }

              onSuccess();
            }}
          />
        )}
      </div>
    </div>
  );
}

function StepUpDialog({
  isOpen,
  onClose,
  onVerify,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onVerify(code);
      toast.success("Withdrawal verified successfully");
      onClose();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : null;
      const message = _e?.message || "Verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-orange-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Security Verification Required
              </h3>
              <p className="text-xs text-gray-600">
                Confirm your identity to proceed
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
            Enter the one-time verification code sent to your registered contact
            to authorize this withdrawal.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <Input type="password"
              required
              autoFocus
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCode(e.target?.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1 text-gray-700 bg-white border-gray-200 hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 text-white bg-green-500 hover:bg-green-600 font-medium text-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "Verifying..." : "Verify & Proceed"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
