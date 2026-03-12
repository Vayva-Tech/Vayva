/**
 * Campaign Wallet Component
 * Allows merchants to fund their ad campaigns using Naira card via Paystack
 */

"use client";

import { useState } from "react";
import { Button, Badge } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Plus, ArrowRight, CreditCard, Building, Copy, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { AdPlatform } from "@/types/ad-platforms";
import { PLATFORM_CONFIGS } from "@/services/ad-platforms/hub";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency } from "@vayva/shared";

interface CampaignWalletProps {
  balance: number;
  platform: AdPlatform;
  onFundSuccess?: () => void;
}

interface FundingOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount: number;
}

const FUNDING_OPTIONS: FundingOption[] = [
  {
    id: "paystack",
    name: "Pay with Card",
    description: "Fund instantly with your Naira debit/credit card",
    icon: <CreditCard className="h-5 w-5" />,
    minAmount: 5000,
    maxAmount: 10000000, // ₦10M
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer to your dedicated virtual account",
    icon: <Building className="h-5 w-5" />,
    minAmount: 1000,
    maxAmount: 50000000, // ₦50M
  },
];

export function CampaignWallet({ balance, platform, onFundSuccess }: CampaignWalletProps) {
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showVirtualAccount, setShowVirtualAccount] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<{
    accountNumber: string;
    bankName: string;
    accountName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const platformConfig = PLATFORM_CONFIGS[platform];

  const handleFund = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const option = FUNDING_OPTIONS.find((o) => o.id === selectedMethod);
    if (!option) return;

    if (parsedAmount < option.minAmount) {
      toast.error(`Minimum funding amount is ${formatCurrency(option.minAmount, "NGN")}`);
      return;
    }

    if (parsedAmount > option.maxAmount) {
      toast.error(`Maximum funding amount is ${formatCurrency(option.maxAmount, "NGN")}`);
      return;
    }

    if (selectedMethod === "bank_transfer") {
      setShowVirtualAccount(true);
      // Fetch virtual account details
      try {
        const wallet = await apiJson<{
          vaStatus: string;
          vaAccountNumber: string;
          vaBankName: string;
          vaAccountName: string;
        }>("/api/wallet");
        if (wallet?.vaStatus === "CREATED") {
          const isTrialMode = wallet.vaAccountNumber === "TRIAL_MODE";
          setVirtualAccount({
            accountNumber: wallet.vaAccountNumber,
            bankName: wallet.vaBankName,
            accountName: wallet.vaAccountName,
          });
        }
      } catch (error) {
        logger.error("[FETCH_VIRTUAL_ACCOUNT]", { error });
        toast.error("Could not load virtual account details");
      }
      return;
    }

    // Paystack card payment
    setLoading(true);
    try {
      const response = await apiJson<{
        authorization_url: string;
        reference: string;
      }>("/api/campaigns/fund", {
        method: "POST",
        body: JSON.stringify({
          amount: parsedAmount * 100, // Convert to kobo
          platform,
          method: "card",
        }),
      });

      if (response?.authorization_url) {
        // Redirect to Paystack
        window.location.href = response.authorization_url;
      }
    } catch (error) {
      logger.error("[CAMPAIGN_FUND_ERROR]", { error });
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="border-l-4" style={{ borderLeftColor: platformConfig.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${platformConfig.color}20` }}
              >
                <Wallet className="h-4 w-4" style={{ color: platformConfig.color }} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Campaign Budget</CardTitle>
                <CardDescription className="text-xs">
                  Available for {platformConfig.name} ads
                </CardDescription>
              </div>
            </div>
            <span className="text-xs border border-muted-foreground/30 px-2 py-1 rounded">
              {formatCurrency(balance, "NGN")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowFundModal(true)}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Funds
          </Button>
        </CardContent>
      </Card>

      {/* Funding Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Add Campaign Funds</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowFundModal(false);
                  setSelectedMethod(null);
                  setAmount("");
                  setShowVirtualAccount(false);
                }}
                className="h-8 w-8"
              >
                ×
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {!showVirtualAccount ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to fund your {platformConfig.name} campaigns.
                    Funds will be available immediately after payment confirmation.
                  </p>

                  <div className="space-y-3">
                    {FUNDING_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedMethod(option.id)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedMethod === option.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedMethod === option.id
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{option.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {option.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Min: {formatCurrency(option.minAmount, "NGN")} • Max:{" "}
                              {formatCurrency(option.maxAmount, "NGN")}
                            </div>
                          </div>
                          {selectedMethod === option.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedMethod && (
                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium">Amount (NGN)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min={FUNDING_OPTIONS.find((o) => o.id === selectedMethod)?.minAmount}
                          step="1000"
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleFund}
                    disabled={!selectedMethod || !amount || loading}
                    className="w-full gap-2"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {virtualAccount ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-medium">Bank Transfer Details</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Transfer exactly {formatCurrency(parseFloat(amount) || 0, "NGN")} to this account
                        </p>
                      </div>

                      <div className="bg-muted rounded-lg p-4 space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Account Number</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-wider">
                              {virtualAccount.accountNumber}
                            </span>
                            <button
                              onClick={() => copyToClipboard(virtualAccount.accountNumber)}
                              className="p-1 hover:bg-background rounded transition-colors"
                            >
                              {copied ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Bank Name</div>
                          <div className="font-medium">{virtualAccount.bankName}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Account Name</div>
                          <div className="font-medium">{virtualAccount.accountName}</div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Funds will be credited automatically within 1-5 minutes</p>
                        <p>• Transfer the exact amount shown above</p>
                        <p>• This account is dedicated to your store</p>
                      </div>

                      <Button
                        onClick={() => {
                          setShowFundModal(false);
                          setShowVirtualAccount(false);
                          onFundSuccess?.();
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        I&apos;ve Made the Transfer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading account details...</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
