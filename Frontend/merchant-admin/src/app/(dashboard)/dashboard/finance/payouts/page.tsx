"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Plus,
  WarningCircle as AlertCircle,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { Button, Input, Select } from "@vayva/ui";
import { Payout, BankAccount, PayoutResponse } from "@/types/finance";
import { apiJson } from "@/lib/api-client-shared";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
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

  if (loading) {
    return (
      <>
        <span className="sr-only">Loading payouts...</span>
        <PageSkeleton variant="table" rows={6} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <p>Payouts page loaded with {payouts.length} transactions</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Payouts
          </h1>
          <p className="text-text-tertiary">
            View your withdrawal history and request new payouts.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-primary text-text-inverse hover:bg-primary/90 font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border overflow-hidden">
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-text-tertiary">
            <p className="mb-2">No payouts found.</p>
            <p className="text-sm">Initiate a withdrawal to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/40 backdrop-blur-sm text-text-secondary font-medium border-b border-border/40">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-background/60">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      {payout.reference}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {formatCurrency(payout.amount, payout.currency)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {payout?.destination?.bankName}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          •••• {payout?.destination?.accountNumber.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payout.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPayouts();
          toast.success("Withdrawal requested successfully");
        }}
        accounts={accounts}
        accountsLoading={accountsLoading}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning border-warning/20",
    PROCESSING: "bg-info/10 text-info border-info/20",
    SUCCESS: "bg-success/10 text-success border-success/20",
    FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const icons: Record<string, React.ElementType> = {
    SUCCESS: CheckCircle,
    FAILED: AlertCircle,
  };

  const StatusIcon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-background/50 text-text-secondary border-border/40"}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center bg-background/40 backdrop-blur-sm px-6 py-4 border-b border-border/40">
          <h3 className="font-semibold text-text-primary">Request Withdrawal</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-secondary h-8 w-8 rounded-full"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true" className="text-xl">
              ×
            </span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Payout Account
            </label>
            {accountsLoading ? (
              <div className="text-sm text-text-tertiary">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg p-3">
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
                className="w-full px-3 py-2 border border-border/60 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-medium">
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
                className="w-full pl-8 pr-4 py-2 border border-border/60 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              Minimum withdrawal: ₦1,000.00
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Transaction PIN
            </label>
            <Input type="password"
              required
              maxLength={6}
              value={pin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPin(e.target?.value)
              }
              className="w-full px-3 py-2 border border-border/60 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              placeholder="••••"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 text-text-secondary bg-background/70 backdrop-blur-xl border-border/40 hover:bg-white/60 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-primary text-text-inverse hover:bg-primary/90 transition-colors"
              disabled={loading || !accountId || !amount}
            >
              {loading ? "Processing..." : "Withdraw"}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Security Verification Required
              </h3>
              <p className="text-xs text-slate-600">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Verification Code
            </label>
            <Input type="password"
              required
              autoFocus
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCode(e.target?.value)
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1 text-slate-700 bg-background/70 backdrop-blur-xl border-slate-300 hover:bg-white/60 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm"
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
