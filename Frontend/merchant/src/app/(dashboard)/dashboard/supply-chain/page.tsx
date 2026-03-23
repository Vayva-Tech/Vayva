"use client";
// @ts-nocheck

import {
  Truck,
  Package,
  Users,
  Phone,
  Clock,
  CheckCircle,
  Calendar,
  ShoppingCart,
  Shield,
  TrendingUp,
  Star,
} from "lucide-react";

const suppliers = [
  {
    id: 1,
    name: "Ade Textiles Ltd",
    contact: "Adeola Bamgbose \u2022 +234 803 456 7890",
    leadTime: "3-5 days",
    reliability: 96,
    reorderStatus: "Reorder Sent",
  },
  {
    id: 2,
    name: "Nkechi Adire Workshop",
    contact: "Nkechi Okonkwo \u2022 +234 816 234 5678",
    leadTime: "5-7 days",
    reliability: 91,
    reorderStatus: "Stock OK",
  },
  {
    id: 3,
    name: "Elegance Lace Imports",
    contact: "Fatima Yusuf \u2022 +234 708 345 6789",
    leadTime: "7-14 days",
    reliability: 84,
    reorderStatus: "Pending Review",
  },
  {
    id: 4,
    name: "Kano Leather Crafts",
    contact: "Musa Ibrahim \u2022 +234 902 123 4567",
    leadTime: "10-14 days",
    reliability: 88,
    reorderStatus: "Stock OK",
  },
];

const purchaseOrders = [
  {
    id: "PO-2026-089",
    supplier: "Ade Textiles Ltd",
    items: "Ankara Premium (50 yds), Damask Gold (30 yds)",
    amount: "\u20A6285,000",
    status: "In Transit",
    expectedDate: "Mar 25, 2026",
  },
  {
    id: "PO-2026-088",
    supplier: "Nkechi Adire Workshop",
    items: "Adire Headwrap Set (100 pcs)",
    amount: "\u20A6192,000",
    status: "Processing",
    expectedDate: "Mar 24, 2026",
  },
  {
    id: "PO-2026-087",
    supplier: "Elegance Lace Imports",
    items: "French Lace (25 yds), Cord Lace (20 yds)",
    amount: "\u20A6450,000",
    status: "Ordered",
    expectedDate: "Mar 28, 2026",
  },
  {
    id: "PO-2026-086",
    supplier: "Ade Textiles Ltd",
    items: "Ankara Standard (80 yards)",
    amount: "\u20A6168,000",
    status: "Delivered",
    expectedDate: "Mar 17, 2026",
  },
  {
    id: "PO-2026-085",
    supplier: "Kano Leather Crafts",
    items: "Leather Clutch Bags (50 pcs), Belts (30 pcs)",
    amount: "\u20A6375,000",
    status: "In Transit",
    expectedDate: "Mar 22, 2026",
  },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Ordered: "bg-purple-50 text-purple-700",
  Delivered: "bg-green-50 text-green-700",
};

const reorderColors: Record<string, string> = {
  "Reorder Sent": "bg-blue-50 text-blue-700",
  "Stock OK": "bg-green-50 text-green-700",
  "Pending Review": "bg-amber-50 text-amber-700",
};

const healthIndicators = [
  { label: "On-time delivery", value: 92 },
  { label: "Quality score", value: 96 },
  { label: "Cost efficiency", value: 88 },
];

export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supply Chain</h1>
        <p className="text-sm text-gray-500 mt-1">Manage suppliers, purchase orders, and logistics</p>
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">4</p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">7</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Lead Time</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">5 days</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{supplier.contact}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${reorderColors[supplier.reorderStatus]}`}>
                  {supplier.reorderStatus}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Lead time: {supplier.leadTime}</span>
              </div>

              {/* Reliability bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Reliability</span>
                  <span className="font-bold text-gray-900">{supplier.reliability}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${supplier.reliability >= 90 ? "bg-green-500" : supplier.reliability >= 85 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${supplier.reliability}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Purchase Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track and manage all purchase orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{po.id}</td>
                  <td className="px-5 py-4 text-gray-700">{po.supplier}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs max-w-[220px] truncate">{po.items}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{po.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[po.status]}`}>
                      {po.status === "Delivered" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {po.status === "In Transit" && <Truck className="w-3 h-3 mr-1" />}
                      {po.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {po.expectedDate}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Chain Health */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Supply Chain Health</h2>
        <p className="text-xs text-gray-500 mb-5">Key performance indicators across your supply chain</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthIndicators.map((indicator) => (
            <div key={indicator.label}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">{indicator.label}</span>
                <span className="font-bold text-gray-900">{indicator.value}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${indicator.value >= 95 ? "bg-green-500" : indicator.value >= 90 ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${indicator.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
