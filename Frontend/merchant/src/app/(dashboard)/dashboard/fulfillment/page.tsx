"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  ArrowRight,
  Clock,
} from "lucide-react";

const kpiCards = [
  {
    label: "Pending Shipments",
    value: 23,
    icon: Clock,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    label: "Ready for Pickup",
    value: 8,
    icon: MapPin,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "In Transit",
    value: 15,
    icon: Truck,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    label: "Delivered Today",
    value: 42,
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

const sections = [
  {
    title: "Shipments",
    description:
      "Track and manage all outbound shipments, print labels, and update delivery statuses.",
    icon: Truck,
    href: "/dashboard/fulfillment/shipments",
    count: 38,
    countLabel: "active shipments",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    title: "Pickups",
    description:
      "Manage in-store and curbside pickup orders, notify customers, and confirm handoffs.",
    icon: MapPin,
    href: "/dashboard/fulfillment/pickups",
    count: 8,
    countLabel: "pending pickups",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
];

export default function FulfillmentPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-50">
          <Package className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Fulfillment
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of shipments, pickups, and delivery operations
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-page Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.title}
              href={section.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${section.bg}`}>
                  <Icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {section.count} {section.countLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-500 group-hover:gap-2 transition-all">
                      View all
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
