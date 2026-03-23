"use client";
// @ts-nocheck

import {
  Database,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Download,
  Play,
  CheckCircle,
  HardDrive,
  FileSpreadsheet,
} from "lucide-react";

const dataSources = [
  {
    id: "orders",
    name: "Orders",
    icon: ShoppingCart,
    records: 384,
    syncStatus: "Synced",
    lastSync: "2 min ago",
    color: "bg-green-50 text-green-600",
  },
  {
    id: "products",
    name: "Products",
    icon: Package,
    records: 47,
    syncStatus: "Synced",
    lastSync: "5 min ago",
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "customers",
    name: "Customers",
    icon: Users,
    records: 1247,
    syncStatus: "Synced",
    lastSync: "3 min ago",
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "transactions",
    name: "Transactions",
    icon: CreditCard,
    records: 2840,
    syncStatus: "Synced",
    lastSync: "1 min ago",
    color: "bg-amber-50 text-amber-600",
  },
];

const recentExports = [
  {
    id: 1,
    name: "Q1 Orders Export",
    date: "Mar 22, 2026",
    format: "CSV",
    size: "12.4 MB",
  },
  {
    id: 2,
    name: "Customer Segments Analysis",
    date: "Mar 20, 2026",
    format: "Excel",
    size: "24.1 MB",
  },
  {
    id: 3,
    name: "Product Performance Data",
    date: "Mar 18, 2026",
    format: "CSV",
    size: "5.6 MB",
  },
  {
    id: 4,
    name: "February Transaction History",
    date: "Mar 15, 2026",
    format: "Excel",
    size: "34.2 MB",
  },
];

const storageUsed = 2.4;
const storageTotal = 10;
const storagePct = (storageUsed / storageTotal) * 100;

export default function DataWarehousePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Data Warehouse</h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">PRO</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Centralized data storage, querying, and exports</p>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Data Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataSources.map((source) => {
            const Icon = source.icon;
            return (
              <div key={source.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${source.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{source.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">{source.syncStatus}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Records</span>
                    <span className="font-bold text-gray-900">{source.records.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last sync</span>
                    <span className="font-medium text-gray-600">{source.lastSync}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query Builder */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Query Builder</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
        <textarea
          className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          placeholder="Write SQL query here... e.g. SELECT * FROM orders WHERE status = 'completed' LIMIT 10;"
          readOnly
        />
      </div>

      {/* Recent Exports */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Exports</h2>
          <p className="text-xs text-gray-500 mt-0.5">Previously exported datasets</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentExports.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{exp.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{exp.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                  exp.format === "CSV" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                }`}>
                  {exp.format}
                </span>
                <span className="text-xs text-gray-500 w-16 text-right">{exp.size}</span>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Storage Usage</h2>
          </div>
          <span className="text-sm font-semibold text-gray-700">{storageUsed} GB / {storageTotal} GB</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${storagePct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{(storageTotal - storageUsed).toFixed(1)} GB remaining</p>
      </div>
    </div>
  );
}
