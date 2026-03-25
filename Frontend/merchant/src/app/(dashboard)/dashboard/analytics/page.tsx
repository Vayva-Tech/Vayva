"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  DollarSign,
  ShoppingCart,
  Heart,
  BarChart3,
  Users,
  Clock,
  MousePointerClick,
  FileText,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */
function formatNaira(val: number): string {
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(1)}K`;
  return `₦${val.toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/*  Sparkline SVG                                                      */
/* ------------------------------------------------------------------ */
function Sparkline({ data, color = "#22C55E" }: { data: number[]; color?: string }) {
  const w = 80;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace("#", "")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue vs Orders Dual-Axis Area Chart                             */
/* ------------------------------------------------------------------ */
const REVENUE_DATA = [
  { label: "Mon", revenue: 820000, orders: 124 },
  { label: "Tue", revenue: 960000, orders: 145 },
  { label: "Wed", revenue: 1150000, orders: 178 },
  { label: "Thu", revenue: 890000, orders: 132 },
  { label: "Fri", revenue: 1340000, orders: 210 },
  { label: "Sat", revenue: 1520000, orders: 248 },
  { label: "Sun", revenue: 1080000, orders: 165 },
  { label: "Mon", revenue: 940000, orders: 140 },
  { label: "Tue", revenue: 1100000, orders: 168 },
  { label: "Wed", revenue: 1280000, orders: 198 },
  { label: "Thu", revenue: 1050000, orders: 155 },
  { label: "Fri", revenue: 1450000, orders: 225 },
  { label: "Sat", revenue: 1620000, orders: 260 },
  { label: "Sun", revenue: 1180000, orders: 182 },
];

function DualAxisChart() {
  const w = 720;
  const h = 300;
  const pt = 30;
  const pb = 40;
  const pl = 65;
  const pr = 55;
  const cw = w - pl - pr;
  const ch = h - pt - pb;

  const maxRev = Math.max(...REVENUE_DATA.map((d) => d.revenue)) * 1.1;
  const maxOrd = Math.max(...REVENUE_DATA.map((d) => d.orders)) * 1.1;

  const revPoints = REVENUE_DATA.map((d, i) => ({
    x: pl + (i / (REVENUE_DATA.length - 1)) * cw,
    y: pt + ch - (d.revenue / maxRev) * ch,
  }));
  const ordPoints = REVENUE_DATA.map((d, i) => ({
    x: pl + (i / (REVENUE_DATA.length - 1)) * cw,
    y: pt + ch - (d.orders / maxOrd) * ch,
  }));

  const buildLine = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const buildArea = (pts: { x: number; y: number }[]) =>
    `${buildLine(pts)} L${pts[pts.length - 1].x},${pt + ch} L${pts[0].x},${pt + ch} Z`;

  const revTicks = [0, 0.25, 0.5, 0.75, 1];
  const ordTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {revTicks.map((f) => {
        const y = pt + ch - f * ch;
        return (
          <line key={f} x1={pl} y1={y} x2={pl + cw} y2={y} stroke="#F3F4F6" strokeWidth="1" />
        );
      })}

      {/* Revenue area + line */}
      <path d={buildArea(revPoints)} fill="url(#revGrad)" />
      <path d={buildLine(revPoints)} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Orders area + line */}
      <path d={buildArea(ordPoints)} fill="url(#ordGrad)" />
      <path d={buildLine(ordPoints)} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />

      {/* Revenue dots */}
      {revPoints.map((p, i) => (
        <circle key={`r${i}`} cx={p.x} cy={p.y} r="3" fill="#22C55E" stroke="white" strokeWidth="2" />
      ))}

      {/* Left Y-axis labels (Revenue) */}
      {revTicks.map((f) => (
        <text key={`rl${f}`} x={pl - 8} y={pt + ch - f * ch + 4} textAnchor="end" fill="#22C55E" fontSize="10" fontWeight="500">
          {formatNaira(f * maxRev)}
        </text>
      ))}

      {/* Right Y-axis labels (Orders) */}
      {ordTicks.map((f) => (
        <text key={`ol${f}`} x={pl + cw + 8} y={pt + ch - f * ch + 4} textAnchor="start" fill="#3B82F6" fontSize="10" fontWeight="500">
          {Math.round(f * maxOrd)}
        </text>
      ))}

      {/* X-axis labels */}
      {REVENUE_DATA.map((d, i) => {
        if (i % 2 !== 0 && i !== REVENUE_DATA.length - 1) return null;
        const x = pl + (i / (REVENUE_DATA.length - 1)) * cw;
        return (
          <text key={`xl${i}`} x={x} y={h - 10} textAnchor="middle" fill="#9CA3AF" fontSize="11">
            {d.label}
          </text>
        );
      })}

      {/* Axis titles */}
      <text x={12} y={pt + ch / 2} textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="600" transform={`rotate(-90, 12, ${pt + ch / 2})`}>
        Revenue (₦)
      </text>
      <text x={w - 8} y={pt + ch / 2} textAnchor="middle" fill="#3B82F6" fontSize="10" fontWeight="600" transform={`rotate(90, ${w - 8}, ${pt + ch / 2})`}>
        Orders
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sales by Channel Donut Chart                                       */
/* ------------------------------------------------------------------ */
const CHANNELS = [
  { name: "Online Store", pct: 42, color: "#22C55E" },
  { name: "WhatsApp", pct: 28, color: "#25D366" },
  { name: "Instagram", pct: 18, color: "#E1306C" },
  { name: "Walk-in", pct: 12, color: "#3B82F6" },
];

function ChannelDonut() {
  const r = 70;
  const stroke = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
        {CHANNELS.map((ch) => {
          const len = (ch.pct / 100) * circ;
          const seg = (
            <circle
              key={ch.name}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={ch.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 100 100)"
            />
          );
          offset += len;
          return seg;
        })}
        <text x="100" y="94" textAnchor="middle" fill="#111827" fontSize="24" fontWeight="700">
          ₦4.8M
        </text>
        <text x="100" y="114" textAnchor="middle" fill="#6B7280" fontSize="11">
          Total Sales
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        {CHANNELS.map((ch) => (
          <div key={ch.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
            <span className="text-xs text-gray-600">{ch.name}</span>
            <span className="text-xs font-semibold text-gray-900 ml-auto">{ch.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top Categories Horizontal Bar Chart                                */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { name: "Fashion", revenue: 1_620_000, color: "#22C55E" },
  { name: "Accessories", revenue: 1_180_000, color: "#10B981" },
  { name: "Shoes", revenue: 940_000, color: "#3B82F6" },
  { name: "Beauty", revenue: 720_000, color: "#8B5CF6" },
  { name: "Home", revenue: 540_000, color: "#F59E0B" },
];

function CategoryBars() {
  const maxRev = CATEGORIES[0].revenue;
  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat, i) => (
        <div key={cat.name}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-4">#{i + 1}</span>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatNaira(cat.revenue)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(cat.revenue / maxRev) * 100}%`, backgroundColor: cat.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Customer Acquisition Line Chart                                    */
/* ------------------------------------------------------------------ */
const ACQUISITION_DATA = [
  { week: "W1", newC: 320, returning: 180 },
  { week: "W2", newC: 380, returning: 210 },
  { week: "W3", newC: 350, returning: 240 },
  { week: "W4", newC: 420, returning: 260 },
  { week: "W5", newC: 460, returning: 290 },
  { week: "W6", newC: 410, returning: 310 },
  { week: "W7", newC: 490, returning: 340 },
  { week: "W8", newC: 530, returning: 360 },
];

function AcquisitionChart() {
  const w = 400;
  const h = 200;
  const pt = 20;
  const pb = 30;
  const pl = 40;
  const pr = 10;
  const cw = w - pl - pr;
  const ch = h - pt - pb;

  const allVals = ACQUISITION_DATA.flatMap((d) => [d.newC, d.returning]);
  const maxV = Math.max(...allVals) * 1.15;

  const toPoints = (vals: number[]) =>
    vals.map((v, i) => ({
      x: pl + (i / (vals.length - 1)) * cw,
      y: pt + ch - (v / maxV) * ch,
    }));

  const newPts = toPoints(ACQUISITION_DATA.map((d) => d.newC));
  const retPts = toPoints(ACQUISITION_DATA.map((d) => d.returning));
  const buildLine = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="newCGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="retCGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pt + ch - f * ch;
        return <line key={f} x1={pl} y1={y} x2={pl + cw} y2={y} stroke="#F3F4F6" strokeWidth="1" />;
      })}

      {/* New customers */}
      <path d={`${buildLine(newPts)} L${newPts[newPts.length - 1].x},${pt + ch} L${newPts[0].x},${pt + ch} Z`} fill="url(#newCGrad)" />
      <path d={buildLine(newPts)} fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {newPts.map((p, i) => (
        <circle key={`n${i}`} cx={p.x} cy={p.y} r="2.5" fill="#22C55E" stroke="white" strokeWidth="1.5" />
      ))}

      {/* Returning customers */}
      <path d={`${buildLine(retPts)} L${retPts[retPts.length - 1].x},${pt + ch} L${retPts[0].x},${pt + ch} Z`} fill="url(#retCGrad)" />
      <path d={buildLine(retPts)} fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {retPts.map((p, i) => (
        <circle key={`r${i}`} cx={p.x} cy={p.y} r="2.5" fill="#A855F7" stroke="white" strokeWidth="1.5" />
      ))}

      {/* Y-axis labels */}
      {[0, 0.5, 1].map((f) => (
        <text key={`y${f}`} x={pl - 6} y={pt + ch - f * ch + 4} textAnchor="end" fill="#9CA3AF" fontSize="10">
          {Math.round(f * maxV)}
        </text>
      ))}

      {/* X-axis labels */}
      {ACQUISITION_DATA.map((d, i) => (
        <text key={`x${i}`} x={pl + (i / (ACQUISITION_DATA.length - 1)) * cw} y={h - 8} textAnchor="middle" fill="#9CA3AF" fontSize="10">
          {d.week}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Hourly Traffic Heatmap                                             */
/* ------------------------------------------------------------------ */
const HEATMAP_DATA = [
  // 7 days x 12 hours (6am–5pm simplified)
  [2, 3, 5, 7, 8, 9, 10, 8, 6, 7, 5, 3],
  [1, 4, 6, 8, 9, 10, 9, 7, 5, 6, 4, 2],
  [3, 5, 7, 9, 10, 8, 7, 9, 8, 5, 3, 2],
  [2, 3, 6, 8, 7, 9, 10, 10, 7, 6, 4, 1],
  [4, 6, 8, 10, 10, 9, 8, 7, 9, 8, 6, 4],
  [5, 7, 9, 10, 9, 8, 7, 6, 8, 9, 7, 5],
  [3, 5, 7, 8, 7, 6, 5, 4, 6, 7, 5, 3],
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p"];

function heatColor(val: number): string {
  if (val <= 2) return "#F0FDF4";
  if (val <= 4) return "#BBF7D0";
  if (val <= 6) return "#86EFAC";
  if (val <= 8) return "#4ADE80";
  if (val <= 9) return "#22C55E";
  return "#16A34A";
}

function HeatmapGrid() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[360px]">
        {/* Hour headers */}
        <div className="flex items-center mb-1">
          <div className="w-10 shrink-0" />
          {HOURS.map((hr) => (
            <div key={hr} className="flex-1 text-center text-[10px] text-gray-400 font-medium">
              {hr}
            </div>
          ))}
        </div>
        {/* Rows */}
        {HEATMAP_DATA.map((row, di) => (
          <div key={di} className="flex items-center gap-0.5 mb-0.5">
            <div className="w-10 text-[10px] text-gray-500 font-medium shrink-0">{DAYS[di]}</div>
            {row.map((val, hi) => (
              <div
                key={hi}
                className="flex-1 h-6 rounded-sm transition-colors"
                style={{ backgroundColor: heatColor(val) }}
                title={`${DAYS[di]} ${HOURS[hi]}: intensity ${val}/10`}
              />
            ))}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-gray-400 mr-1">Low</span>
          {[2, 4, 6, 8, 10].map((v) => (
            <div key={v} className="w-4 h-3 rounded-sm" style={{ backgroundColor: heatColor(v) }} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">High</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Performance Metrics Table                                          */
/* ------------------------------------------------------------------ */
const PERF_METRICS = [
  { label: "Conversion Rate", value: "3.42%", change: 0.8, icon: MousePointerClick },
  { label: "Bounce Rate", value: "38.5%", change: -2.1, icon: TrendingDown },
  { label: "Avg. Session Duration", value: "4m 23s", change: 5.6, icon: Clock },
  { label: "Pages per Session", value: "5.8", change: 3.2, icon: FileText },
];

/* ================================================================== */
/*  Main Analytics Page                                                */
/* ================================================================== */
export default function AnalyticsPage() {
  const [activeRange, setActiveRange] = useState<"today" | "7d" | "30d" | "90d">("30d");

  const ranges: { key: typeof activeRange; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
    { key: "90d", label: "90d" },
  ];

  const summaryCards = [
    {
      title: "Total Revenue",
      value: "₦4,820,000",
      change: 12.4,
      sparkData: [28, 32, 35, 30, 38, 42, 40, 45, 48, 52],
      sparkColor: "#22C55E",
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: "1,847",
      change: 8.2,
      sparkData: [120, 135, 128, 140, 155, 148, 162, 170, 165, 180],
      sparkColor: "#3B82F6",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Average Order Value",
      value: "₦2,610",
      change: 3.7,
      sparkData: [22, 24, 23, 25, 24, 26, 25, 27, 26, 28],
      sparkColor: "#8B5CF6",
      icon: BarChart3,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Customer Retention",
      value: "68.4%",
      change: -1.2,
      sparkData: [72, 70, 69, 71, 68, 67, 69, 68, 67, 68],
      sparkColor: "#F59E0B",
      icon: Heart,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Add product</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>View orders</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/customers"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Customers</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Insight
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                AI suggestions
              </div>
              <p className="text-sm text-gray-500 mt-1">
                We’ll surface anomalies, trends, and recommended actions here.
              </p>
              <div className="mt-4 rounded-xl bg-green-50 border border-green-100 p-4">
                <div className="text-sm font-semibold text-green-900">Tip</div>
                <p className="text-sm text-green-800 mt-1">
                  Focus on conversion rate + AOV to compound revenue growth.
                </p>
              </div>
            </div>
          </>
        }
      >
        <PageHeader
          title="Analytics"
          subtitle="Track performance, identify trends, and make data-driven decisions."
          actions={
            <>
              <div className="inline-flex items-center rounded-xl bg-gray-100 p-1">
                {ranges.map((r) => (
                  <Button
                    key={r.key}
                    onClick={() => setActiveRange(r.key)}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeRange === r.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
              <Button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </>
          }
        />

      {/* ---- 4 Summary Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const positive = card.change >= 0;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(card.change).toFixed(1)}%
                </span>
                <Sparkline data={card.sparkData} color={card.sparkColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Row: Revenue vs Orders (2-col) + Sales by Channel ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Revenue vs Orders</h3>
              <p className="text-sm text-gray-500 mt-0.5">Dual-axis comparison over the last 14 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-blue-500 rounded-full border-dashed" style={{ borderTop: "2px dashed #3B82F6", height: 0, width: 12 }} />
                <span className="text-xs text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          <DualAxisChart />
        </div>

        {/* Sales by Channel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Sales by Channel</h3>
            <p className="text-sm text-gray-500 mt-0.5">Revenue distribution by source</p>
          </div>
          <div className="flex items-center justify-center py-2">
            <ChannelDonut />
          </div>
        </div>
      </div>

      {/* ---- Row: Top Categories + Customer Acquisition ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Top Categories</h3>
            <p className="text-sm text-gray-500 mt-0.5">Product categories ranked by revenue</p>
          </div>
          <CategoryBars />
        </div>

        {/* Customer Acquisition */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Customer Acquisition</h3>
              <p className="text-sm text-gray-500 mt-0.5">New vs returning customers over 8 weeks</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">New</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-500">Returning</span>
              </div>
            </div>
          </div>
          <AcquisitionChart />
        </div>
      </div>

      {/* ---- Row: Hourly Traffic Heatmap + Performance Metrics ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Hourly Traffic Heatmap</h3>
            <p className="text-sm text-gray-500 mt-0.5">Busiest hours across the week</p>
          </div>
          <HeatmapGrid />
        </div>

        {/* Performance Metrics Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Performance Metrics</h3>
            <p className="text-sm text-gray-500 mt-0.5">Key engagement indicators</p>
          </div>
          <div className="space-y-0">
            {PERF_METRICS.map((metric, idx) => {
              const positive = metric.change >= 0;
              return (
                <div
                  key={metric.label}
                  className={`flex items-center justify-between py-4 ${
                    idx < PERF_METRICS.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                      <metric.icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </PageWithInsights>
    </div>
  );
}

