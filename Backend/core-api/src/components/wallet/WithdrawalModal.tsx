import {
  logger,
  WithdrawalEligibility,
  WithdrawalQuote,
  PayoutAccount,
} from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Icon, Modal, cn } from "@vayva/ui";
import { toast } from "sonner";

import { apiJson } from "@/lib/api-client-shared";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

export const WithdrawalModal = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawalModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<WithdrawalEligibility | null>(
    null,
  );
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [quote, setQuote] = useState<WithdrawalQuote | null>(null);

  // Load Eligibility on Open
  useEffect(() => {
    const controller = new AbortController();
    if (isOpen) {
      setStep(1);
      const loadData = async () => {
        setLoading(true);
        try {
          const [eligRes, accRes] = await Promise.all([
            apiJson<WithdrawalEligibility>("/api/wallet/withdraw/eligibility", {
              signal: controller.signal,
            }),
            apiJson<PayoutAccount[]>("/api/wallet/payout-accounts", {
              signal: controller.signal,
            }),
          ]);
          setEligibility(eligRes);
          setAccounts(accRes || []);
          if (accRes && accRes.length > 0) setSelectedAccount(accRes[0].id);
        } catch (error: unknown) {
          const _errMsg =
            error instanceof Error ? error.message : String(error);
          logger.error("[LOAD_WITHDRAWAL_DATA_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        } finally {
          setLoading(false);
        }
      };
      void loadData();
    }
    return () => controller.abort();
  }, [isOpen]);

  const handleGetQuote = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const q = await apiJson<WithdrawalQuote>("/api/wallet/withdraw/quote", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount.toString()) || 0,
          payout_account_id: selectedAccount,
        }),
      });
      setQuote(q);
      setStep(3);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[GET_WITHDRAWAL_QUOTE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to get withdrawal quote");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiJson<{ success: boolean }>("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount.toString()) || 0,
          payout_account_id: selectedAccount,
        }),
      });
      toast.success("Withdrawal requested successfully");
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[CONFIRM_WITHDRAWAL_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-6 text-xs font-bold text-text-tertiary">
      <span className={cn(step >= 1 ? "text-black" : "")}>1. Check</span>
      <span className="h-px w-4 bg-border" />
      <span className={cn(step >= 2 ? "text-black" : "")}>2. Value</span>
      <span className="h-px w-4 bg-border" />
      <span className={cn(step >= 3 ? "text-black" : "")}>3. Review</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Funds"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <StepIndicator />

        {/* STEP 1: ELIGIBILITY */}
        {step === 1 && (
          <div className="space-y-4">
            {loading && (
              <div className="text-text-tertiary text-sm">
                Checking eligibility...
              </div>
            )}

            {eligibility && (
              <>
                <div className="p-4 bg-white/40 rounded-xl border border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      KYC Status
                    </span>
                    {eligibility.kycStatus === "verified" ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <Icon name={"AlertTriangle"} size={12} /> Action
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      Payout Account
                    </span>
                    {eligibility.hasPayoutAccount ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        Added
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        Missing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      Available Balance
                    </span>
                    <span className="font-mono text-sm font-bold">
                      ₦{availableBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {eligibility.isEligible ? (
                  <Button onClick={() => setStep(2)} className="w-full">
                    Continue
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-3">
                      {eligibility.blockedReasons[0] ||
                        "Please resolve the issues above."}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-tertiary uppercase">
                Payout Account
              </label>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => !loading && setSelectedAccount(acc.id)}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between",
                    loading && "opacity-50 cursor-not-allowed",
                    selectedAccount === acc.id
                      ? "border-black bg-white/40 shadow-sm"
                      : "border-border",
                  )}
                >
                  <div>
                    <div className="font-bold text-sm text-text-primary">
                      {acc.bankName}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {acc.accountName} • {acc.accountNumber}
                    </div>
                  </div>
                  {selectedAccount === acc.id && (
                    <Icon name="Check" size={16} className="text-black" />
                  )}
                </div>
              ))}
              {/* Placeholder for Add Functionality */}
              <Button
                variant="link"
                className="text-xs font-bold text-black underline pl-1 pt-1 h-auto p-0 hover:no-underline"
                disabled={loading}
              >
                + Add another account
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-tertiary uppercase">
                Amount to Withdraw
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">
                  ₦
                </span>
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(Number(e.target.value))
                  }
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl font-mono text-lg font-bold focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-text-tertiary px-1">
                <span>Balance: ₦{availableBalance.toLocaleString()}</span>
                <Button
                  variant="link"
                  onClick={() => !loading && setAmount(availableBalance)}
                  disabled={loading}
                  className="font-bold text-blue-600 hover:underline h-auto p-0"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleGetQuote}
                className="flex-1"
                disabled={!amount || amount > availableBalance || loading}
              >
                {loading ? "Calculating..." : "Review"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 3 && quote && (
          <div className="space-y-6">
            <div className="bg-white/40 border border-border/40 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Amount</span>
                <span className="font-bold font-mono">
                  ₦{quote.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Service Fee</span>
                <span className="font-bold font-mono text-text-secondary">
                  - ₦{quote.fee.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-text-primary">
                  Total to You
                </span>
                <span className="font-bold font-mono text-green-600">
                  ₦{quote.netAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-4 rounded-xl text-xs">
              <Icon name="Info" size={16} className="shrink-0 mt-0.5" />
              <p>
                Funds will arrive in your{" "}
                <strong>
                  {accounts.find((a) => a.id === selectedAccount)?.bankName}
                </strong>{" "}
                account {quote.estimatedArrival}.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
