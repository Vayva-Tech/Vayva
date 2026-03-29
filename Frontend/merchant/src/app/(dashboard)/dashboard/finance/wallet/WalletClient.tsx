"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, EmptyState } from "@vayva/ui";
import { Wallet } from "@phosphor-icons/react/ssr";
import WalletGuard from "@/components/wallet/WalletGuard";
import { WithdrawFundsTrigger } from "@/components/wallet/WithdrawFundsTrigger";
import { AccountCard } from "@/components/finance/AccountCard";

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

type ActivityItem = {
  id: string;
  kind: "CHARGE" | "WITHDRAWAL" | "REFUND" | "AFFILIATE_PAYOUT";
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  direction: "in" | "out";
  counterparty?: string;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function WalletClient({ balance, pending, wallet }: WalletClientProps) {
  const router = useRouter();
  const { data: activityData, isLoading: activityLoading } = useSWR<{ data: ActivityItem[] }>(
    "/finance/activity?limit=10",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );
  const activity = Array.isArray(activityData?.data) ? activityData?.data : [];

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
            <Button variant="outline" onClick={() => router.push("/dashboard/finance/transactions")}>
              History
            </Button>
            <WithdrawFundsTrigger />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Available Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(balance)}
              </div>
              <p className="text-xs text-gray-500">
                + {formatter.format(pending)} pending
              </p>
            </CardContent>
          </Card>

          <AccountCard
            title="Dedicated virtual account"
            badge={wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE") ? "Active" : "Not created"}
            subtitle="Use this account to fund your wallet"
            primaryValue={wallet?.vaAccountNumber || "—"}
            secondaryValue={
              wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE")
                ? `${wallet.vaBankName} • ${wallet.vaAccountName}`
                : "Complete KYC to create a dedicated account."
            }
            lines={wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE") ? ["Send money here to fund your wallet"] : []}
            copyItems={
              wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE")
                ? [
                    { label: "Copy account number", value: wallet.vaAccountNumber },
                    { label: "Copy account name", value: wallet.vaAccountName },
                    { label: "Copy bank name", value: wallet.vaBankName },
                  ]
                : []
            }
            primaryAction={{
              label: wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE") ? "Accounts" : "Complete KYC",
              onClick: () =>
                router.push(
                  wallet && (wallet.vaStatus === "CREATED" || wallet.vaStatus === "ACTIVE")
                    ? "/dashboard/finance/accounts"
                    : "/dashboard/settings/kyc",
                ),
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Your recent inflows and outflows.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/dashboard/finance/activity")}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="py-8 text-sm text-gray-500">Loading…</div>
              ) : activity.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  icon="AlertCircle"
                  description="Your inflows and withdrawals will appear here."
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {activity.map((it) => (
                    <div key={`${it.kind}-${it.id}`} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {it.kind === "CHARGE"
                            ? "Incoming payment"
                            : it.kind === "WITHDRAWAL"
                              ? "Withdrawal"
                              : it.kind === "REFUND"
                                ? "Refund"
                                : "Affiliate payout"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(it.date).toLocaleString("en-NG")}
                          {it.counterparty ? ` • ${it.counterparty}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${it.direction === "in" ? "text-green-700" : "text-gray-900"}`}>
                          {it.direction === "in" ? "+" : "-"}
                          ₦{Number(it.amount || 0).toLocaleString("en-NG")}
                        </div>
                        <div className="text-[11px] text-gray-500">{(it.status || "").replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </WalletGuard>
  );
}
