"use client";
// @ts-nocheck

import { useState } from "react";
import useSWR from "swr";
import {
  Megaphone,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Mail,
  MessageSquare,
  Tag,
  Zap,
  Instagram,
  MessageCircle,
  Heart,
  ChevronRight,
  CheckCircle2,
  PauseCircle,
  FileEdit,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CampaignsData {
  kpis: { label: string; value: string }[];
  campaignPerformance: { name: string; impressions: number; conversions: number }[];
  activeCampaigns: { id: string; name: string; status: string; reach: string; conversions: number; spend: string }[];
  socialStats: { platform: string; value: string; change: string }[];
}

/* ------------------------------------------------------------------ */
/*  SWR Fetcher                                                        */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */

function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
      </div>
      <div className="w-24 h-4 bg-gray-100 rounded mb-2" />
      <div className="w-12 h-7 bg-gray-100 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="w-40 h-5 bg-gray-100 rounded mb-2" />
      <div className="w-56 h-4 bg-gray-100 rounded mb-6" />
      <div className="w-full h-64 bg-gray-50 rounded-xl" />
    </div>
  );
}

function CampaignTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-6 pb-4">
        <div className="w-36 h-5 bg-gray-100 rounded mb-2" />
        <div className="w-52 h-4 bg-gray-100 rounded" />
      </div>
      <div className="space-y-0 divide-y divide-gray-50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="w-40 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-5 bg-gray-100 rounded-full" />
            <div className="flex-1" />
            <div className="w-16 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-4 bg-gray-100 rounded" />
            <div className="w-20 h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Actions (static)                                             */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    title: "Email Campaign",
    description: "Send targeted emails to your subscriber list",
    icon: Mail,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "SMS Blast",
    description: "Reach customers instantly via bulk SMS",
    icon: MessageSquare,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    title: "Discount Code",
    description: "Generate unique promo codes for customers",
    icon: Tag,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Flash Sale",
    description: "Launch a time-limited sale with countdown",
    icon: Zap,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
];

// ── Status badge config ────────────────────────────────────
const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  Active: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: CheckCircle2,
  },
  Paused: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: PauseCircle,
  },
  Draft: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: FileEdit,
  },
};

// ── Chart helpers ──────────────────────────────────────────
function BarChartSVG({ campaignPerformance }: { campaignPerformance: { name: string; impressions: number; conversions: number }[] }) {
  if (!campaignPerformance || campaignPerformance.length === 0) return null;
  const maxImpressions = Math.max(...campaignPerformance.map((c) => c.impressions));
  const chartWidth = 500;
  const chartHeight = 200;
  const barGroupWidth = chartWidth / campaignPerformance.length;
  const barWidth = 28;
  const gap = 6;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-64">
      {campaignPerformance.map((campaign, i) => {
        const x = i * barGroupWidth + (barGroupWidth - barWidth * 2 - gap) / 2;
        const impHeight = (campaign.impressions / maxImpressions) * chartHeight;
        const convHeight = (campaign.conversions / maxImpressions) * chartHeight;

        return (
          <g key={campaign.name}>
            {/* Impressions bar */}
            <rect
              x={x}
              y={chartHeight - impHeight}
              width={barWidth}
              height={impHeight}
              rx={4}
              fill="#22C55E"
              opacity={0.25}
            />
            {/* Conversions bar */}
            <rect
              x={x + barWidth + gap}
              y={chartHeight - convHeight}
              width={barWidth}
              height={convHeight}
              rx={4}
              fill="#22C55E"
            />
            {/* Label */}
            <text
              x={x + barWidth + gap / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize="10"
            >
              {campaign.name.length > 10
                ? campaign.name.slice(0, 10) + "..."
                : campaign.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── KPI Icon Map ──────────────────────────────────────────
const kpiIcons: Record<string, { icon: any; iconBg: string; iconColor: string }> = {
  "Campaigns Active": { icon: Megaphone, iconBg: "bg-green-50", iconColor: "text-green-600" },
  "Email Subscribers": { icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  "Conversion Rate": { icon: TrendingUp, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  "Revenue from Campaigns": { icon: DollarSign, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
};

// ── Social Icon Map ───────────────────────────────────────
const socialIcons: Record<string, any> = {
  "Instagram Followers": Instagram,
  "WhatsApp Reach": MessageCircle,
  "Engagement Rate": Heart,
};

// ── Page Component ─────────────────────────────────────────
export default function MarketingPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<CampaignsData>(
    '/api/campaigns',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const kpiData = data?.kpis || [];
  const campaignPerformance = data?.campaignPerformance || [];
  const activeCampaigns = data?.activeCampaigns || [];
  const socialStats = data?.socialStats || [];

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load campaigns</h3>
          <p className="text-sm text-gray-500 mb-4">There was a problem fetching your marketing data. Please try again.</p>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-pulse">
            <div className="w-32 h-7 bg-gray-100 rounded mb-2" />
            <div className="w-64 h-4 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <KPICardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
        <CampaignTableSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <KPICardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || (activeCampaigns.length === 0 && kpiData.length === 0)) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing</h1>
            <p className="text-sm text-gray-500 mt-1">Create campaigns and grow your audience across Nigeria</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Megaphone className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No campaigns yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">Create your first marketing campaign to grow your store</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Marketing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create campaigns and grow your audience across Nigeria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors">
            <Plus size={16} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const iconConfig = kpiIcons[kpi.label] || { icon: Megaphone, iconBg: "bg-gray-50", iconColor: "text-gray-600" };
          const Icon = iconConfig.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${iconConfig.iconBg} flex items-center justify-center`}
                >
                  <Icon size={18} className={iconConfig.iconColor} />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Campaign Performance Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Campaign Performance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Impressions vs conversions for last 5 campaigns
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 opacity-25" />
              Impressions
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500" />
              Conversions
            </div>
          </div>
        </div>
        <BarChartSVG campaignPerformance={campaignPerformance} />
      </div>

      {/* Active Campaigns List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Active Campaigns
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your running and planned campaigns
            </p>
          </div>
          <button className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
            View All
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Campaign</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Reach</div>
          <div className="col-span-2 text-right">Conversions</div>
          <div className="col-span-3 text-right">Spend</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {activeCampaigns.map((campaign) => {
            const style = statusStyles[campaign.status] ?? statusStyles.Active;
            const StatusIcon = style.icon;

            return (
              <div
                key={campaign.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
                  >
                    <StatusIcon size={12} />
                    {campaign.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.reach}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.conversions.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.spend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => setSelectedAction(action.title)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left hover:border-green-200 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  <Icon size={22} className={action.iconColor} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {action.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-green-600 group-hover:text-green-700 transition-colors">
                  Get Started
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Media Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Social Media Stats
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your social reach across platforms
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {socialStats.map((stat) => {
            const Icon = socialIcons[stat.platform] || Heart;
            return (
              <div
                key={stat.platform}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Icon size={22} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.platform}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight size={12} />
                    {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
