"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, PaperPlaneRight as Send, Clock, Users, Chat as MessageSquare } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { cn, Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { logger } from "@vayva/shared";

export default function NewCampaignPage(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channel: "EMAIL",
    type: "NEWSLETTER",
    messageBody: "",
    segmentId: "all",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    (e as React.FormEvent).preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ops/growth/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // If we had a real segment selection, we'd pass it here.
          // For now, it's just a placeholder or manual entry.
          storeId: "platform-ops", // System wide campaign
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");

      toast.success("Campaign created successfully");
      router.push("/ops/communications/campaigns");
    } catch (error: unknown) {
      toast.error("Failed to create campaign");
      logger.error("[CAMPAIGN_CREATE_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OpsPageShell
      title="Create New Campaign"
      description="Design a new blast to your merchant or customer base"
      breadcrumbs={false}
    >

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  name: (e as React.ChangeEvent<HTMLInputElement>).target.value,
                })
              }
              placeholder="e.g. June Merchant Newsletter"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Campaign Type
            </label>
            <select
              aria-label="Campaign Type"
              value={form.type}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  type: (e as React.ChangeEvent<HTMLInputElement>).target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="NEWSLETTER">Newsletter</option>
              <option value="ALERT">System Alert</option>
              <option value="PROMO">Promotion / Offer</option>
              <option value="ONBOARDING">Onboarding Drip</option>
            </select>
          </div>
        </div>

        {/* Channel & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Channel
            </label>
            <div className="flex gap-2">
              {["EMAIL", "SMS", "WHATSAPP", "PUSH"].map((c: any) => (
                <Button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, channel: c })}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg border transition-all h-auto",
                    form.channel === c
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <select
                title="Target Audience"
                aria-label="Target Audience"
                value={form.segmentId}
                onChange={(e: any) =>
                  setForm({
                    ...form,
                    segmentId: (e as React.ChangeEvent<HTMLInputElement>).target
                      .value,
                  })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
              >
                <option value="all">All Active Merchants</option>
                <option value="inactive">Inactive Merchants (30d)</option>
                <option value="high-value">High Value (Premium)</option>
                <option value="waitlist">Waitlist Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message Content
            <span className="text-xs font-normal text-gray-500 ml-2">
              (Markdown supported for Email)
            </span>
          </label>
          <textarea
            required
            value={form.messageBody}
            onChange={(e: any) =>
              setForm({
                ...form,
                messageBody: (e as React.ChangeEvent<HTMLInputElement>).target
                  .value,
              })
            }
            rows={8}
            placeholder="Write your message here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors h-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg active:scale-95 flex items-center gap-2 h-auto"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Clock size={16} /> Schedule Campaign
              </>
            )}
          </Button>
        </div>
      </form>
    </OpsPageShell>
  );
}
