"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";
import { DonationOptions } from "@/templates/giveflow/components/DonationOptions";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  goal: number;
  raised: number;
  currency: string;
  bannerImage: string | null;
  featured: boolean;
}

export default function DonationFormBlock({ campaignId }: { campaignId?: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        if (campaignId) {
          const url = new URL("/api/storefront/campaigns/one", window.location.origin);
          url.searchParams.set("campaignId", campaignId);
          const res = await fetch(url.toString());
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch campaign"));
          setCampaign((json as any)?.data || null);
          return;
        }

        const url = new URL("/api/storefront/campaigns", window.location.origin);
        url.searchParams.set("featured", "true");
        url.searchParams.set("limit", "1");
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch campaigns"));

        const first = ((json as any)?.data || [])[0] || null;
        setCampaign(first);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.DonationForm.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [campaignId]);

  const canOpen = useMemo(() => {
    return Boolean(campaign?.id && email.trim());
  }, [campaign, email]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading donation form...</div>;

  if (error || !campaign) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error || "Campaign not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-transparent p-6">
        <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Donate</div>
        <div className="mt-1 text-2xl font-black tracking-tight">Support {campaign.title}</div>
        {campaign.description ? (
          <div className="mt-3 text-sm text-text-secondary">{campaign.description}</div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </div>

        <div className="mt-5">
          <Button
            disabled={!canOpen}
            onClick={() => setOpen(true)}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            Donate now
          </Button>
          <div className="mt-2 text-[10px] text-text-tertiary">
            You’ll be redirected to payment.
          </div>
        </div>
      </div>

      <DonationOptions
        isOpen={open}
        onClose={() => setOpen(false)}
        campaignTitle={campaign.title}
        onDonate={async (amount: number, isRecurring: boolean) => {
          try {
            const checkoutRes = await fetch("/api/storefront/campaigns/donate/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                campaignId: campaign.id,
                amount,
                donorEmail: email.trim(),
                donorName: name.trim() || null,
                recurring: isRecurring,
              }),
            });

            const checkoutJson = await checkoutRes.json().catch(() => ({}));
            if (!checkoutRes.ok) {
              throw new Error(String((checkoutJson as any)?.error || "Checkout failed"));
            }

            const reference = (checkoutJson as any)?.data?.reference;
            if (!reference) throw new Error("Missing payment reference");

            const payRes = await fetch("/api/payments/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference }),
            });

            const payJson = await payRes.json().catch(() => ({}));
            if (!payRes.ok) {
              throw new Error(String((payJson as any)?.error || "Payment init failed"));
            }

            const authorizationUrl = (payJson as any)?.authorizationUrl;
            if (authorizationUrl) {
              window.location.href = authorizationUrl;
              return;
            }
          } catch (e: unknown) {
            reportError(e, { scope: "CommerceBlock.DonationForm.checkout", app: "storefront" });
          } finally {
            setOpen(false);
          }
        }}
        isRecurringAvailable={true}
      />
    </div>
  );
}
