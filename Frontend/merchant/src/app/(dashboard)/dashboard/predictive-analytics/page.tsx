"use client";

import {
  Brain,
  Target,
  Calendar,
  Lightbulb,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";

const predictions = [
  {
    id: 1,
    title: "Ankara dresses demand +40% next month",
    description: "Owambe season is approaching fast. Based on last year's data and current search trends, expect a major spike in Ankara dress orders across Lagos and Abuja.",
    confidence: 92,
  },
  {
    id: 2,
    title: "Stock Adire before Owambe season",
    description: "Historical data shows 3x increase in headwrap and Adire sales during April-May. Current stock will run out by mid-April if not replenished.",
    confidence: 87,
  },
  {
    id: 3,
    title: "WhatsApp orders to surpass Instagram by Q2",
    description: "WhatsApp order growth is 2.5x higher than Instagram. Projected crossover in late April. Consider prioritizing WhatsApp catalog updates.",
    confidence: 78,
  },
  {
    id: 4,
    title: "Lace fabric prices dropping 15% by May",
    description: "Import data from Trade Fair Lagos shows incoming large shipments. Delay bulk lace purchases to save on procurement costs.",
    confidence: 74,
  },
  {
    id: 5,
    title: "Customer churn risk: 12 VIP customers inactive",
    description: "12 customers with lifetime value above \u20A6200K have not ordered in 45+ days. Re-engagement campaign recommended immediately.",
    confidence: 85,
  },
];

const inventoryOptimizations = [
  {
    product: "Ankara Maxi Dress",
    action: "Reorder 36 units before April 5",
    reason: "Demand forecast shows +40% increase next month",
    icon: ShoppingBag,
  },
  {
    product: "Adire Headwrap Set",
    action: "Increase stock to 50 units",
    reason: "Owambe season begins in 3 weeks",
    icon: Package,
  },
  {
    product: "Lace Blouse (Ivory)",
    action: "Reduce reorder quantity by 15%",
    reason: "Declining demand trend detected",
    icon: AlertTriangle,
  },
  {
    product: "Aso-Oke Clutch Bag",
    action: "Maintain current stock levels",
    reason: "Steady growth in accessories category",
    icon: TrendingUp,
  },
];

// SVG chart data — 30 days of predicted vs actual
const days = Array.from({ length: 30 }, (_, i) => i + 1);
const actualData = [42, 45, 38, 50, 55, 48, 60, 63, 58, 70, 65, 72, 68, 75, 80, 78, 82, null, null, null, null, null, null, null, null, null, null, null, null, null];
const predictedData = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 85, 88, 92, 95, 90, 98, 102, 108, 105, 112, 118, 115, 120];

function buildPolyline(data: (number | null)[], width: number, height: number, padX: number, padY: number) {
  const allValues = [...actualData, ...predictedData].filter((d) => d !== null) as number[];
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);
  const range = maxVal - minVal || 1;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  return data
    .map((val, i) => {
      if (val === null) return null;
      const x = padX + (i / (data.length - 1)) * chartW;
      const y = padY + chartH - ((val - minVal) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
}

export default function PredictiveAnalyticsPage() {
  const W = 720;
  const H = 260;
  const PX = 45;
  const PY = 30;

  const actualLine = buildPolyline(actualData, W, H, PX, PY);
  const predictedLine = buildPolyline(predictedData, W, H, PX, PY);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Predictive Analytics</h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">PRO</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">AI-powered demand forecasts and optimization insights</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          Updated today
        </span>
      </div>

      {/* Demand Forecast Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Demand Forecast</h2>
            <p className="text-xs text-gray-500 mt-0.5">Predicted vs actual order volume over the next 30 days</p>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-green-500 rounded" />
              <span className="text-gray-500">Predicted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-gray-400 rounded" style={{ borderTop: "2px dashed #9CA3AF" }} />
              <span className="text-gray-500">Actual</span>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[260px]">
            {/* Horizontal grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = PY + ((H - PY * 2) / 4) * i;
              return <line key={i} x1={PX} y1={y} x2={W - PX} y2={y} stroke="#f3f4f6" strokeWidth="1" />;
            })}
            {/* X-axis day labels */}
            {[1, 5, 10, 15, 20, 25, 30].map((d) => {
              const x = PX + ((d - 1) / 29) * (W - PX * 2);
              return (
                <text key={d} x={x} y={H - 8} textAnchor="middle" className="text-[10px] fill-gray-400">
                  Day {d}
                </text>
              );
            })}
            {/* Actual line (gray dashed) */}
            <polyline
              points={actualLine}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Predicted line (green solid) */}
            <polyline
              points={predictedLine}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Shaded area under predicted */}
            {predictedLine && (
              <polygon
                points={`${predictedLine} ${(PX + (29 / 29) * (W - PX * 2)).toFixed(1)},${(H - PY).toFixed(1)} ${(PX + (17 / 29) * (W - PX * 2)).toFixed(1)},${(H - PY).toFixed(1)}`}
                fill="#22C55E"
                opacity="0.08"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Top 5 Predictions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Top 5 Predictions</h2>
        <div className="space-y-3">
          {predictions.map((pred) => (
            <div key={pred.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-green-50 shrink-0 mt-0.5">
                  <Brain className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{pred.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Target className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-green-600">{pred.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pred.description}</p>
                  <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pred.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Optimization */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Inventory Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventoryOptimizations.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.product} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 shrink-0">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.product}</h3>
                    <p className="text-sm text-green-600 font-medium mt-1">{item.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
