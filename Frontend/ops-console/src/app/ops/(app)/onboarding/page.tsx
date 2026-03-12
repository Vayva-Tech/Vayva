"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { CheckCircle, Clock, Users, Storefront as Store, MagnifyingGlass as Search, ArrowCounterClockwise as RefreshCw, PaperPlane as Send, Envelope as Mail, Chat as MessageSquare, Calendar, ArrowUpRight, Funnel as Filter } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import Link from "next/link";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { OpsDataTable } from "@/components/ops/OpsDataTable";

interface OnboardedMerchant {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPhone: string | null;
  industry: string;
  plan: string;
  completedAt: string;
  createdAt: string;
}

interface OnboardingStats {
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  pendingOnboarding: number;
  recentCompletions: OnboardedMerchant[];
}

export default function OnboardingPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("week");
  const [selectedMerchants, setSelectedMerchants] = useState<Set<string>>(
    new Set(),
  );
  const [sendingNotification, setSendingNotification] = useState(false);

  const { data, isLoading, refetch } = useOpsQuery<OnboardingStats>(
    ["onboarding-stats", timeFilter],
    () =>
      fetch(`/api/ops/onboarding?period=${timeFilter}`).then((res) =>
        res.json(),
      ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { placeholderData: (prev: any) => prev },
  );

  const stats = data || {
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    pendingOnboarding: 0,
    recentCompletions: [],
  };

  const merchants = stats.recentCompletions ?? [];
  const filteredMerchants = searchQuery
    ? merchants.filter(
        (m: OnboardedMerchant) =>
          m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : merchants;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedMerchants);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMerchants(next);
  };

  const toggleSelectAll = () => {
    if (selectedMerchants.size === filteredMerchants.length) {
      setSelectedMerchants(new Set());
    } else {
      setSelectedMerchants(
        new Set(filteredMerchants.map((m: OnboardedMerchant) => m.id)),
      );
    }
  };

  const sendNotification = async (type: "email" | "whatsapp") => {
    if (selectedMerchants.size === 0) {
      toast.error("Please select at least one merchant");
      return;
    }

    setSendingNotification(true);
    try {
      const res = await fetch("/api/ops/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantIds: Array.from(selectedMerchants),
          type,
          template: "welcome_onboarding",
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const result = await res.json();
      toast.success(`Notification sent to ${result.sent} merchants`);
      setSelectedMerchants(new Set());
    } catch (error) {
      toast.error("Failed to send notifications");
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <OpsPageShell
      title="Onboarding Completions"
      description="Track merchants who completed onboarding and send welcome notifications"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      <div className="space-y-8">

      {/* Stats Cards */}
      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={() => setTimeFilter("today")}
          className={`flex-1 p-4 rounded-xl border-2 text-left transition-all h-auto ${
            timeFilter === "today"
              ? "bg-green-50 border-green-300"
              : "bg-white border-gray-100 hover:border-green-200"
          }`}
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={14} />
            <span className="text-xs font-medium">Today</span>
          </div>
          <div className="text-2xl font-black text-green-600">
            {stats.completedToday}
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTimeFilter("week")}
          className={`flex-1 p-4 rounded-xl border-2 text-left transition-all h-auto ${
            timeFilter === "week"
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-100 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={14} />
            <span className="text-xs font-medium">This Week</span>
          </div>
          <div className="text-2xl font-black text-blue-600">
            {stats.completedThisWeek}
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTimeFilter("month")}
          className={`flex-1 p-4 rounded-xl border-2 text-left transition-all h-auto ${
            timeFilter === "month"
              ? "bg-purple-50 border-purple-300"
              : "bg-white border-gray-100 hover:border-purple-200"
          }`}
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={14} />
            <span className="text-xs font-medium">This Month</span>
          </div>
          <div className="text-2xl font-black text-purple-600">
            {stats.completedThisMonth}
          </div>
        </Button>

        <div className="flex-1 p-4 rounded-xl border-2 border-gray-100 bg-white shadow-sm flex items-center gap-3">
          <Clock size={14} className="text-gray-500 shrink-0" />
          <span className="text-xs font-medium text-gray-500">Pending</span>
          <span className="text-2xl font-black text-orange-600">
            {stats.pendingOnboarding}
          </span>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by store name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target?.value)}
          />
        </div>

        {selectedMerchants.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {selectedMerchants.size} selected
            </span>
            <Button
              size="sm"
              onClick={() => sendNotification("email")}
              disabled={sendingNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9"
            >
              <Mail size={14} className="mr-1" />
              PaperPlane as Send Email
            </Button>
            <Button
              size="sm"
              onClick={() => sendNotification("whatsapp")}
              disabled={sendingNotification}
              className="bg-green-600 hover:bg-green-700 text-white h-9"
            >
              <MessageSquare size={14} className="mr-1" />
              PaperPlane as Send WhatsApp
            </Button>
          </div>
        )}
      </div>

      {/* Merchants Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    filteredMerchants.length > 0 &&
                    selectedMerchants.size === filteredMerchants.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  aria-label="Select all"
                />
              </th>
              <th className="px-6 py-3">Store</th>
              <th className="px-6 py-3">Owner</th>
              <th className="px-6 py-3">Industry</th>
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">Completed</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredMerchants.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No merchants found
                </td>
              </tr>
            ) : (
              filteredMerchants.map((merchant: OnboardedMerchant) => (
                <tr
                  key={merchant.id}
                  className={`hover:bg-gray-50 ${selectedMerchants.has(merchant.id) ? "bg-indigo-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMerchants.has(merchant.id)}
                      onChange={() => toggleSelect(merchant.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={`Select ${merchant.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/ops/merchants/${merchant.id}`}
                      className="block"
                    >
                      <div className="font-semibold text-gray-900 hover:text-indigo-600">
                        {merchant.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {merchant.slug}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{merchant.ownerEmail}</div>
                    {merchant.ownerPhone && (
                      <div className="text-xs text-gray-500">
                        {merchant.ownerPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium capitalize">
                      {merchant.industry?.replace(/_/g, " ") || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        merchant.plan === "PRO"
                          ? "bg-purple-100 text-purple-700"
                          : merchant.plan === "STARTER"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {merchant.plan || "FREE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(merchant.completedAt).toLocaleDateString()}
                    <br />
                    <span className="text-gray-400">
                      {new Date(merchant.completedAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/ops/merchants/${merchant.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      View <ArrowUpRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </OpsPageShell>
  );
}
