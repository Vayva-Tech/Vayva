"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, Icon, cn } from "@vayva/ui";
import { toast } from "sonner";
import { Spinner as Loader2, ShieldCheck, WarningCircle as AlertCircle, Clock, Globe, CreditCard } from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface DiagnosticData {
  id: string;
  name: string;
  slug: string;
  onboardingStatus: string;
  industrySlug: string;
  kycStatus: string;
  isActive: boolean;
  payoutsEnabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kycDetails: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletStatus: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any[];
}

export default function MerchantDiagnosticPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ops/merchants/${id}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => toast.error("Failed to load diagnostics"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );

  if (!data) return <div>Not found</div>;

  const kycStatusColor =
    {
      VERIFIED: "text-green-600 bg-green-50 border-green-200",
      PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
      FAILED: "text-red-600 bg-red-50 border-red-200",
      NOT_STARTED:
        "text-gray-600 bg-gray-100 border-gray-200",
    }[data.kycStatus] || "text-gray-400";

  return (
    <OpsPageShell
      title={data.name}
      description={`ID: ${data.id}`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-blue-500" />
              <span className="font-bold">Onboarding</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium uppercase">
                  {data.onboardingStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Industry</span>
                <span className="font-medium uppercase">
                  {data.industrySlug || "Not Set"}
                </span>
              </div>
            </div>
          </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-vayva-green" />
            <span className="font-bold">Security & Gating</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Active</span>
              <span
                className={data.isActive ? "text-green-600" : "text-red-600"}
              >
                {data.isActive ? "YES" : "NO"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payouts</span>
              <span
                className={
                  data.payoutsEnabled ? "text-green-600" : "text-red-600"
                }
              >
                {data.payoutsEnabled ? "ENABLED" : "BLOCKED"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-purple-500" />
            <span className="font-bold">Wallet</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Balance</span>
              <span className="font-bold">
                ₦{(data.walletStatus?.availableKobo / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Locked</span>
              <span>{data.walletStatus?.isLocked ? "YES" : "NO"}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-black mb-4 flex items-center gap-2">
            <Clock size={18} /> Verification History
          </h3>
          <div className="space-y-4">
            {data.history?.map((log, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b pb-2 last:border-0"
              >
                <div>
                  <div className="text-sm font-bold">
                    {log?.action?.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-300">{log.ip}</div>
              </div>
            ))}
            {(!data.history || data.history?.length === 0) && (
              <p className="text-gray-400 text-sm">
                No verification events logged.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4 flex items-center gap-2">
            <AlertCircle size={18} /> Gating Determination
          </h3>
          <div className="space-y-4">
            <div
              className={cn(
                "p-4 rounded-lg flex items-start gap-3",
                data.kycStatus === "VERIFIED"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700",
              )}
            >
              {data.kycStatus === "VERIFIED" ? (
                <ShieldCheck />
              ) : (
                <AlertCircle />
              )}
              <div>
                <div className="font-bold">Finance Block</div>
                <p className="text-sm">
                  {data.kycStatus === "VERIFIED"
                    ? "Merchant has passed identity verification. Withdrawals are unlocked."
                    : "Merchant has not passed BVN/NIN verification. Withdrawals are blocked in finance/page.tsx."}
                </p>
              </div>
            </div>
            {!data.industrySlug && (
              <div className="p-4 rounded-lg bg-orange-50 text-orange-700 flex items-start gap-3">
                <AlertCircle />
                <div>
                  <div className="font-bold">Industry Gate Active</div>
                  <p className="text-sm">
                    Merchant will be redirected to onboarding/industry in
                    admin-shell.tsx.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>
    </OpsPageShell>
  );
}
