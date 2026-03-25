"use client";
import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button, Input, Switch } from "@vayva/ui";
import { Building as Building2, CreditCard, WarningCircle as AlertCircle, Bank as PiggyBank, CurrencyDollar as DollarSign, CheckCircle, Wallet, Spinner as Loader2 } from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";

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

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-4 text-sm text-gray-500">Loading payment settings...</span>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const hasVerifiedAccount = settlementAccount?.isVerified;
  const isActivePaymentMethods = bankTransfers ? 1 : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Payment Settings"
        subtitle="Configure payment methods and settlement accounts"
      />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryWidget
          icon={<CreditCard size={18} />}
          label="Active Methods"
          value={String(isActivePaymentMethods)}
          trend="enabled"
          positive
        />
        <SummaryWidget
          icon={<PiggyBank size={18} />}
          label="Settlement Account"
          value={hasVerifiedAccount ? "Verified" : "Not Set"}
          trend={hasVerifiedAccount ? "ready" : "needs setup"}
          positive={!!hasVerifiedAccount}
        />
        <SummaryWidget
          icon={<Wallet size={18} />}
          label="Bank Transfers"
          value={bankTransfers ? "Enabled" : "Disabled"}
          trend="payment type"
          positive={bankTransfers}
        />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Bank Transfer</div>
                  <div className="text-xs text-gray-500">Direct bank transfers</div>
                </div>
              </div>
              <Switch
                checked={bankTransfers}
                onCheckedChange={setBankTransfers}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Account */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement Account</h2>
          
          {settlementAccount && settlementAccount.isVerified ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-green-900 mb-1">Verified Bank Account</div>
                  <div className="text-sm text-green-700">
                    <div className="font-medium">{settlementAccount.accountName}</div>
                    <div>{settlementAccount.bankName}</div>
                    <div>Account: ****{settlementAccount.accountNumber?.slice(-4)}</div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowBankDialog(true)}
                  className="px-3 py-1.5 text-sm font-medium text-green-700 bg-white hover:bg-green-100 rounded-lg transition-colors"
                >
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-900 mb-1">No Settlement Account</div>
                  <div className="text-sm text-orange-700">
                    Add your bank account details to receive payments
                  </div>
                </div>
                <Button
                  onClick={() => setShowBankDialog(true)}
                  className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-white hover:bg-orange-100 rounded-lg transition-colors"
                >
                  Add Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bank Account Dialog */}
      {showBankDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white  rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">
              {settlementAccount ? "Edit" : "Add"} Bank Account
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bank-name"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  Bank Name
                </label>
                <Input id="bank-name"
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankName: e.target?.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. GTBank, Access Bank"
                />
              </div>
              <div>
                <label
                  htmlFor="account-number"
                  className="block text-xs font-bold text-gray-500 mb-1"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label
                  htmlFor="account-name"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  Account Name
                </label>
                <Input id="account-name"
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountName: e.target?.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
                className="text-gray-500 font-medium text-sm hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBank}
                disabled={savingBank}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-text-green-600"
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
