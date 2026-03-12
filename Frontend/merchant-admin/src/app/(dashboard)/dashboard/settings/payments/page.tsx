"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, Input, Switch } from "@vayva/ui";
import {
  Bank as Building2,
  CreditCard,
  WarningCircle as AlertCircle,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";

import { apiJson } from "@/lib/api-client-shared";

interface SettlementAccount {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  isVerified?: boolean;
}

export default function PaymentsSettingsPage() {
  const [bankTransfers, setBankTransfers] = useState(true);
  const [settlementAccount, setSettlementAccount] =
    useState<SettlementAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await apiJson<SettlementAccount>(
          "/api/settings/payments/beneficiaries",
        );
        setSettlementAccount(data ?? null);
      } catch (e: any) {
        const message = e instanceof Error ? e.message : "Unknown error";
        logger.warn("[LOAD_BENEFICIARIES_ERROR]", {
          error: message,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleSaveBank = async () => {
    if (
      !bankForm.bankName ||
      !bankForm.accountNumber ||
      !bankForm.accountName
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setSavingBank(true);
    try {
      const data = await apiJson<SettlementAccount>(
        "/api/settings/payments/beneficiaries",
        {
          method: "POST",
          body: JSON.stringify(bankForm),
        },
      );

      setSettlementAccount(data ?? null);
      setShowBankDialog(false);
      setBankForm({ bankName: "", accountNumber: "", accountName: "" });
      toast.success("Bank account saved successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save bank account";
      logger.error("[SAVE_BANK_ERROR]", { error: message, app: "merchant" });
      toast.error(message);
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <Breadcrumbs />
      <BackButton href="/dashboard/settings/overview" className="mb-4" />
      <div className="flex items-center gap-4">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payments
          </h1>
          <p className="text-slate-500">
            Manage how you get paid and how customers pay you.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Settlement Account */}
        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-slate-900">
                  Settlement Account
                </h3>
                <Button
                  variant="link"
                  onClick={() => {
                    if (settlementAccount) {
                      setBankForm({
                        bankName: settlementAccount.bankName || "",
                        accountNumber: settlementAccount.accountNumber || "",
                        accountName: settlementAccount.accountName || "",
                      });
                    }
                    setShowBankDialog(true);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline px-0 h-auto"
                >
                  {settlementAccount ? "Edit" : "Add Account"}
                </Button>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                Funds from your sales will be settled to this account.
              </p>

              {loading ? (
                <div className="h-20 bg-background/40 backdrop-blur-sm rounded-lg animate-pulse" />
              ) : settlementAccount ? (
                <div className="bg-background/40 backdrop-blur-sm rounded-lg border border-slate-100 p-4 max-w-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {settlementAccount.bankName}
                    </span>
                    {settlementAccount.isVerified && (
                      <span className="text-xs font-mono text-slate-500 bg-background/70 backdrop-blur-xl px-2 py-0.5 rounded border border-slate-200">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-mono text-slate-700 tracking-wide mb-1">
                    {settlementAccount.accountNumber}
                  </div>
                  <div className="text-sm text-slate-500">
                    {settlementAccount.accountName}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-lg border border-amber-100 p-4 flex gap-3 text-amber-900">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">No settlement account</p>
                    <p className="text-xs mt-1">
                      Add a bank account to receive payouts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accepted Payment Methods */}
        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                Payment Methods
              </h3>
              <p className="text-slate-500 text-sm">
                Methods available to your customers at checkout.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  CARD
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Debit / Credit Cards
                  </p>
                  <p className="text-xs text-slate-500">
                    Visa, Mastercard, Verve
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  XFER
                </div>
                <div>
                  <p className="font-medium text-slate-900">Bank Transfers</p>
                  <p className="text-xs text-slate-500">
                    Direct transfer to virtual account
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="bank-transfers" className="sr-only">
                  Accept bank transfers
                </label>
                <Switch
                  id="bank-transfers"
                  checked={bankTransfers}
                  onCheckedChange={setBankTransfers}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Dialog */}
      {showBankDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background/70 backdrop-blur-xl rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">
              {settlementAccount ? "Edit" : "Add"} Bank Account
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bank-name"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Bank Name
                </label>
                <Input id="bank-name"
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankName: e.target?.value })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. GTBank, Access Bank"
                />
              </div>
              <div>
                <label
                  htmlFor="account-number"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Account Number
                </label>
                <Input id="account-number"
                  type="text"
                  maxLength={10}
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      accountNumber: e.target?.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label
                  htmlFor="account-name"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Account Name
                </label>
                <Input id="account-name"
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountName: e.target?.value })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="Account holder name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBankDialog(false);
                  setBankForm({
                    bankName: "",
                    accountNumber: "",
                    accountName: "",
                  });
                }}
                disabled={savingBank}
                className="text-text-tertiary font-medium text-sm hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBank}
                disabled={savingBank}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-text-primary"
              >
                {savingBank ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
