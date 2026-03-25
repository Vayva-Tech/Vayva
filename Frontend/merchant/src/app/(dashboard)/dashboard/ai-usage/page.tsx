"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CreditBalance = {
  monthlyCredits: number;
  usedCredits: number;
  remainingCredits: number;
  resetDate: string | null;
  plan: string;
};

type PackId = "AI_MESSAGES_250" | "AI_MESSAGES_1000" | "AI_MESSAGES_3000";

const PACKS: Array<{
  id: PackId;
  title: string;
  messages: number;
  priceNgn: number;
}> = [
  { id: "AI_MESSAGES_250", title: "+250 AI messages", messages: 250, priceNgn: 2000 },
  { id: "AI_MESSAGES_1000", title: "+1,000 AI messages", messages: 1000, priceNgn: 5000 },
  { id: "AI_MESSAGES_3000", title: "+3,000 AI messages", messages: 3000, priceNgn: 12000 },
];

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AiUsagePage() {
  const sp = useSearchParams();
  const ref = sp?.get("ref") ?? null;

  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPack, setBusyPack] = useState<PackId | null>(null);
  const [verifying, setVerifying] = useState(false);

  const profitExplainer = useMemo(() => {
    return {
      aiCostPercent: 30,
      marginPercent: 70,
    };
  }, []);

  async function loadBalance() {
    setLoading(true);
    try {
      const res = await fetch("/api/credits/balance", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as CreditBalance | null;
      if (!res.ok || !data) throw new Error("Failed to load AI balance");
      setBalance(data);
    } finally {
      setLoading(false);
    }
  }

  async function buyPack(packId: PackId) {
    setBusyPack(packId);
    try {
      const res = await fetch("/api/ai/credits/topup/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !json?.success || !json?.data?.authorization_url) {
        throw new Error(json?.error || "Failed to start payment");
      }
      window.location.assign(String(json.data.authorization_url));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to start payment");
    } finally {
      setBusyPack(null);
    }
  }

  async function verifyTopup(reference: string) {
    setVerifying(true);
    try {
      const res = await fetch("/api/ai/credits/topup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Verification failed");
      }
      toast.success("Top-up applied. Your AI messages were updated.");
      await loadBalance();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    void loadBalance();
  }, []);

  useEffect(() => {
    if (!ref) return;
    void verifyTopup(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI usage & top-ups</h1>
          <p className="text-sm text-gray-600">
            AI usage is measured in <span className="font-semibold">AI messages</span>.
            One AI reply typically uses 1 message. Heavy features (Autopilot + voice)
            cost more.
          </p>
        </div>
        <Link href="/dashboard/billing">
          <Button variant="outline" className="rounded-xl">
            Billing
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900">This month</h2>
        {loading ? (
          <div className="mt-4 h-10 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Included</p>
              <p className="text-lg font-bold text-gray-900">
                {balance?.monthlyCredits?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Used</p>
              <p className="text-lg font-bold text-gray-900">
                {balance?.usedCredits?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Remaining</p>
              <p className="text-lg font-bold text-gray-900">
                {balance?.remainingCredits?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        )}
        {verifying && (
          <p className="mt-3 text-xs text-gray-500">Verifying payment…</p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900">Top-up packs</h2>
        <p className="mt-1 text-sm text-gray-600">
          Buy more AI messages when you run out.
        </p>

        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {PACKS.map((p) => {
            const aiBudget = Math.round((p.priceNgn * profitExplainer.aiCostPercent) / 100);
            const margin = p.priceNgn - aiBudget;
            return (
              <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-900">{p.title}</p>
                <p className="mt-1 text-sm text-gray-600">{formatNgn(p.priceNgn)}</p>

                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">{profitExplainer.aiCostPercent}%</span> reserved for AI costs:{" "}
                    <span className="font-semibold">{formatNgn(aiBudget)}</span>
                  </p>
                  <p>
                    <span className="font-semibold">{profitExplainer.marginPercent}%</span> Vayva gross margin:{" "}
                    <span className="font-semibold">{formatNgn(margin)}</span>
                  </p>
                </div>

                <Button
                  className="mt-4 w-full rounded-xl bg-green-600 hover:bg-green-700"
                  disabled={busyPack === p.id}
                  onClick={() => void buyPack(p.id)}
                >
                  {busyPack === p.id ? "Starting payment…" : "Buy pack"}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Caps apply per plan (Autopilot runs/month, voice note duration, max reply length) to keep usage predictable.
        </p>
      </div>
    </div>
  );
}

