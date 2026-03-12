"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, EmptyState } from "@vayva/ui";
import { Wallet, House as Building2, Copy } from "@phosphor-icons/react/ssr";
import WalletGuard from "@/components/wallet/WalletGuard";
import { WithdrawFundsTrigger } from "@/components/wallet/WithdrawFundsTrigger";

interface WalletClientProps {
  balance: number;
  pending: number;
  wallet: {
    vaStatus: string;
    vaAccountNumber: string;
    vaBankName: string;
    vaAccountName: string;
  } | null;
}

export function WalletClient({ balance, pending, wallet }: WalletClientProps) {
  // Format currency
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <WalletGuard>
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <p>Available balance: {formatter.format(balance)}</p>
        <p>Pending balance: {formatter.format(pending)}</p>
      </div>

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Wallet & Payouts
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline">History</Button>
            <WithdrawFundsTrigger />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-primary text-text-inverse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-tertiary">
                Available Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(balance)}
              </div>
              <p className="text-xs text-text-tertiary">
                + {formatter.format(pending)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Virtual Account
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {wallet && wallet.vaStatus === "CREATED" ? (
                <div className="space-y-1">
                  <div className="text-xl font-bold flex items-center gap-2">
                    {wallet.vaAccountNumber}
                    <Copy className="h-3 w-3 cursor-pointer text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {wallet.vaBankName} • {wallet.vaAccountName}
                  </p>
                  <p className="text-xs text-primary mt-2 bg-primary/10 p-1 rounded inline-block">
                    Send money here to fund wallet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    No active account. Complete KYC.
                  </span>
                  <Button size="sm" variant="secondary">
                    Setup Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your recent inflows and payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Standardized Empty State */}
              <EmptyState
                title="No recent transactions"
                icon="AlertCircle"
                description="Your recent inflows and payouts will appear here."
                // No action needed for history
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </WalletGuard>
  );
}
