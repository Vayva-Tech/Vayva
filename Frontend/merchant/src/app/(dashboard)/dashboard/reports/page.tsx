"use client";
import { Button } from "@vayva/ui";

import {
  FileText,
  Download,
  Plus,
  BarChart3,
  Package,
  Users,
  DollarSign,
  Receipt,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";

const reportTypes = [
  {
    id: "sales",
    title: "Sales Report",
    description: "Revenue breakdown by product, category, and time period across all channels",
    icon: BarChart3,
    lastGenerated: "Mar 20, 2026",
    color: "bg-green-50 text-green-600",
  },
  {
    id: "inventory",
    title: "Inventory Report",
    description: "Stock levels, low-stock alerts, and reorder suggestions for your warehouse",
    icon: Package,
    lastGenerated: "Mar 18, 2026",
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "customer",
    title: "Customer Report",
    description: "Customer demographics, retention rates, and lifetime value analysis",
    icon: Users,
    lastGenerated: "Mar 15, 2026",
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "financial",
    title: "Financial Report",
    description: "Profit & loss statements, expenses tracking, and cash flow summary",
    icon: DollarSign,
    lastGenerated: "Mar 19, 2026",
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "tax",
    title: "Tax Report",
    description: "VAT collected, withholding tax, and FIRS-ready filing summaries",
    icon: Receipt,
    lastGenerated: "Mar 10, 2026",
    color: "bg-red-50 text-red-600",
  },
  {
    id: "performance",
    title: "Performance Report",
    description: "Conversion rates, page views, and store growth metrics over time",
    icon: TrendingUp,
    lastGenerated: "Mar 21, 2026",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const recentReports = [
  {
    id: 1,
    name: "Monthly Sales Summary - March 2026",
    type: "Sales Report",
    format: "PDF",
    date: "Mar 20, 2026",
  },
  {
    id: 2,
    name: "Inventory Audit Q1 2026",
    type: "Inventory Report",
    format: "CSV",
    date: "Mar 18, 2026",
  },
  {
    id: 3,
    name: "Customer Retention Analysis",
    type: "Customer Report",
    format: "PDF",
    date: "Mar 15, 2026",
  },
  {
    id: 4,
    name: "Weekly Financial Overview",
    type: "Financial Report",
    format: "CSV",
    date: "Mar 19, 2026",
  },
  {
    id: 5,
    name: "VAT Collection Summary - Feb 2026",
    type: "Tax Report",
    format: "PDF",
    date: "Mar 10, 2026",
  },
];

const formatBadgeColor: Record<string, string> = {
  PDF: "bg-red-50 text-red-700",
  CSV: "bg-green-50 text-green-700",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate, view, and export business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export All
          </Button>
          <Button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
            <Plus className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Types Grid (3x2) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Report Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${report.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last generated: {report.lastGenerated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  <Button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Reports</h2>
          <p className="text-xs text-gray-500 mt-0.5">Previously generated reports available for download</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-gray-400">{report.date}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${formatBadgeColor[report.format]}`}
                >
                  {report.format}
                </span>
                <Button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

