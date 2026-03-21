"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label } from "@vayva/ui";
import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  CheckCircle as CheckCircle2,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Shield,
  Bank as BankIcon,
  CaretDown,
  X,
} from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface Bank {
  name: string;
  code: string;
}

interface AccountResolveResponse {
  account_name: string;
}

export default function PaymentStep() {
  const {
    nextStep,
    prevStep,
    updateData,
    state: rawState,
    isSaving,
  } = useOnboarding();
  const state = rawState;
  const [accountNumber, setAccountNumber] = useState(
    state.finance?.accountNumber || "",
  );
  const [selectedBankCode, setSelectedBankCode] = useState(
    state.finance?.bankCode || "",
  );
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [bankSearchQuery, setBankSearchQuery] = useState(
    state.finance?.bankName || "",
  );
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [resolvedName, setResolvedName] = useState(
    state.finance?.accountName || "",
  );
  const [resolving, setResolving] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        setLoadingBanks(true);
        const data = await apiJson<Bank[]>("/api/payments/banks");
        if (Array.isArray(data)) {
          setBanks(data);
          setFilteredBanks(data);
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[LOAD_BANKS_ERROR]", { error: _errMsg, app: "merchant" });
        toast.error(_errMsg || "Failed to load banks");
      } finally {
        setLoadingBanks(false);
      }
    };
    void loadBanks();
  }, []);

  useEffect(() => {
    if (bankSearchQuery) {
      const filtered = banks.filter((bank) =>
        bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()),
      );
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks(banks);
    }
  }, [bankSearchQuery, banks]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankCode) {
      void resolveAccount();
    } else {
      if (resolvedName && (accountNumber.length !== 10 || !selectedBankCode)) {
        setResolvedName("");
      }
    }
  }, [accountNumber, selectedBankCode]);

  const resolveAccount = async () => {
    setResolving(true);
    try {
      const data = await apiJson<AccountResolveResponse>(
        `/api/payments/resolve?account_number=${accountNumber}&bank_code=${selectedBankCode}`,
      );
      setResolvedName(data?.account_name || "");
      toast.success("Account verified!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[RESOLVE_ACCOUNT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setResolvedName("");
      toast.error("Could not verify account name. Please check the details.");
    } finally {
      setResolving(false);
    }
  };

  const handleContinue = () => {
    const trimmedAccountNumber = accountNumber.trim();
    
    if (!trimmedAccountNumber && !selectedBankCode) {
      nextStep();
      return;
    }
    
    if (selectedBankCode && !trimmedAccountNumber) {
      toast.error("Please enter your account number or clear the bank selection to skip.");
      return;
    }
    
    if (trimmedAccountNumber && !selectedBankCode) {
      toast.error("Please select your bank or clear the account number to skip.");
      return;
    }
    
    if (!resolvedName) {
      toast.error("Please wait for account verification or clear both fields to skip.");
      return;
    }

    const bank = banks.find((b) => b.code === selectedBankCode);
    const financeData = {
      finance: {
        bankCode: selectedBankCode,
        bankName: bank?.name || "",
        accountNumber: trimmedAccountNumber,
        accountName: resolvedName,
        methods: {
          bankTransfer: true,
          cash: false,
          pos: false,
        },
      },
    };

    updateData(financeData);
    nextStep(financeData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <CreditCard size={24} className="text-gray-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
          Payout Account
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Add your bank account details to receive payouts from your store sales.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6  space-y-4">
        <div className="space-y-3">
          <div className="space-y-2 relative">
            <Label htmlFor="bankSearch" className="text-black font-semibold flex items-center gap-2">
              <BankIcon className="h-4 w-4 text-vayva-green" />
              Select Bank
            </Label>
            <div className="relative">
              <Input
                id="bankSearch"
                type="text"
                placeholder={loadingBanks ? "Loading banks..." : "Search for your bank..."}
                value={bankSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setBankSearchQuery(e.target.value);
                  setShowBankDropdown(true);
                }}
                onFocus={() => setShowBankDropdown(true)}
                disabled={loadingBanks || isSaving || resolving}
                className="h-12 rounded-xl border-gray-100 focus:border-vayva-green focus:ring-vayva-green/20 pr-10"
              />
              {selectedBankCode && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBankCode("");
                    setBankSearchQuery("");
                    setResolvedName("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                  aria-label="Clear bank selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {!selectedBankCode && (
                <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              )}
            </div>
            {loadingBanks && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading available banks...
              </p>
            )}
            {showBankDropdown && filteredBanks.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredBanks.slice(0, 10).map((bank, index: number) => (
                  <Button
                    key={`${bank.code}-${index}`}
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setSelectedBankCode(bank.code);
                      setBankSearchQuery(bank.name);
                      setShowBankDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-none text-sm border-b border-gray-100 last:border-b-0 h-auto justify-start font-normal"
                  >
                    {bank.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-black font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-vayva-green" />
              Account Number
            </Label>
            <div className="relative">
              <Input
                id="accountNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (resolvedName) setResolvedName("");
                }}
                maxLength={10}
                disabled={isSaving || resolving || !selectedBankCode}
                className={`h-12 rounded-xl border-gray-100 focus:border-vayva-green focus:ring-vayva-green/20 ${resolvedName ? "border-vayva-green pr-10" : ""} ${!selectedBankCode ? "bg-gray-50" : ""}`}
              />
              {resolving && (
                <div className="absolute right-3 top-3.5">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
              {resolvedName && !resolving && (
                <div className="absolute right-3 top-3.5">
                  <CheckCircle2 className="h-5 w-5 text-vayva-green" />
                </div>
              )}
            </div>
            {!selectedBankCode && (
              <p className="text-xs text-gray-400">Please select a bank first</p>
            )}
          </div>

          {resolvedName && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="accountName" className="text-black font-semibold">
                Account Name
              </Label>
              <div className="relative">
                <Input
                  id="accountName"
                  type="text"
                  value={resolvedName}
                  readOnly
                  className="h-12 rounded-xl border-vayva-green bg-vayva-green/5 text-black font-medium focus:border-vayva-green focus:ring-vayva-green/20"
                />
                <div className="absolute right-3 top-3.5">
                  <CheckCircle2 className="h-5 w-5 text-vayva-green" />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/40 p-3 rounded-xl">
            <Shield className="h-4 w-4 text-vayva-green" />
            <span>Your bank details are securely encrypted and processed by Paystack.</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSaving}
          className="h-12 px-6 rounded-xl border-gray-100 hover:bg-white/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          className="flex-1 h-12 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold"
          onClick={handleContinue}
          disabled={isSaving || resolving}
        >
          {!accountNumber && !selectedBankCode ? "Skip for Now" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
