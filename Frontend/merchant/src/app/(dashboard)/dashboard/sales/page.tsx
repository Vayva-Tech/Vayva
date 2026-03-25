"use client";

import { useState, useEffect, useCallback } from "react";
import { User, FileText, Warning, TrendUp, Target, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { HubGrid, type HubModule } from "@/components/shared";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

const salesModules: HubModule[] = [
  {
    id: "leads",
    title: "Leads",
    description: "Manage sales leads and prospects",
    icon: User,
    href: "/dashboard/leads",
    color: "blue",
  },
  {
    id: "quotes",
    title: "Quotes",
    description: "Create and track price quotes",
    icon: FileText,
    href: "/dashboard/quotes",
    color: "green",
  },
  {
    id: "rescue",
    title: "Rescue",
    description: "Emergency rescue operations",
    icon: Warning,
    href: "/dashboard/rescue",
    color: "amber",
  },
];

export default function SalesHubPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Leads", value: "0", icon: Target },
    { label: "Pending Quotes", value: "0", icon: FileText },
    { label: "Active Rescue", value: "0", icon: Warning },
    { label: "Won / leads", value: "—", icon: TrendUp },
  ]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, quotesRes] = await Promise.all([
        apiJson<{ success?: boolean; data?: Array<{ status?: string }> }>(
          "/api/leads?limit=200",
        ),
        apiJson<{ success?: boolean; data?: Array<{ status?: string }> }>(
          "/api/quotes?limit=200",
        ),
      ]);
      const leads = leadsRes.data ?? [];
      const quotes = quotesRes.data ?? [];
      const pendingQuotes = quotes.filter((q) => {
        const s = (q.status ?? "").toLowerCase();
        return s === "pending" || s === "draft" || s === "sent";
      }).length;
      const wonLeads = leads.filter((l) => {
        const s = (l.status ?? "").toLowerCase();
        return s === "won" || s === "converted" || s === "closed_won";
      }).length;
      const conv =
        leads.length > 0 ? `${Math.round((wonLeads / leads.length) * 100)}%` : "—";
      setStats([
        { label: "Total Leads", value: String(leads.length), icon: Target },
        { label: "Open quotes", value: String(pendingQuotes), icon: FileText },
        {
          label: "Active Rescue",
          value: "0",
          icon: Warning,
        },
        { label: "Win rate (sample)", value: conv, icon: TrendUp },
      ]);
    } catch {
      toast.error("Could not load sales stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales & Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage leads, quotes, and rescue operations</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-sm text-gray-500 py-4">Loading…</div>
        ) : (
          stats.map((stat) => (
            <SummaryWidget
              key={stat.label}
              icon={<stat.icon size={18} />}
              label={stat.label}
              value={stat.value}
              trend="Live data"
              positive
            />
          ))
        )}
      </div>

      {/* Hub Modules */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Modules</h2>
        <HubGrid modules={salesModules} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/leads/new" className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
            <Plus size={24} className="text-green-600 mb-2" />
            <div className="font-semibold text-gray-900">New Lead</div>
            <div className="text-xs text-gray-500">Add a new prospect</div>
          </Link>
          <Link href="/dashboard/quotes/new" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            <FileText size={24} className="text-blue-600 mb-2" />
            <div className="font-semibold text-gray-900">Create Quote</div>
            <div className="text-xs text-gray-500">Generate price quote</div>
          </Link>
          <Link href="/dashboard/rescue/incidents" className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
            <Warning size={24} className="text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900">Report Incident</div>
            <div className="text-xs text-gray-500">Emergency response</div>
          </Link>
        </div>
      </div>
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
