// @ts-nocheck
"use client";

import React from "react";
import { Utensils, Music, Armchair, Camera, CheckSquare } from "lucide-react";
import { formatCurrency } from "@vayva/ui";

interface VendorsLogisticsProps {
  data?: {
    totalVendors: number;
    byCategory?: {
      catering: any[];
      avEquipment: any[];
      furniture: any[];
      photography: any[];
      other: any[];
    };
    tasks?: any[];
    taskSummary?: {
      total: number;
      completed: number;
      pending: number;
    };
  };
}

const CATEGORY_ICONS = {
  catering: Utensils,
  av_equipment: Music,
  furniture: Armchair,
  photography: Camera,
};

const STATUS_EMOJIS = {
  confirmed: "✅",
  setup_complete: "✅",
  pending_delivery: "⏳",
  pending: "⏳",
};

export function VendorsLogistics({ data }: VendorsLogisticsProps) {
  if (!data) return null;

  const { byCategory, tasks = [], taskSummary } = data;
  const allVendors = [
    ...(byCategory?.catering || []),
    ...(byCategory?.avEquipment || []),
    ...(byCategory?.furniture || []),
    ...(byCategory?.photography || []),
  ];

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">
        Vendors & Logistics
      </h3>

      {/* Task Summary */}
      {taskSummary && (
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-900">Task Checklist</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">
              {taskSummary.completed}/{taskSummary.total} Completed
            </p>
            <p className="text-xs font-bold text-blue-700">
              {Math.round((taskSummary.completed / taskSummary.total) * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* Vendors List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {allVendors.slice(0, 6).map((vendor) => {
          const Icon = CATEGORY_ICONS[vendor.category as keyof typeof CATEGORY_ICONS] || Utensils;
          const emoji = STATUS_EMOJIS[vendor.status as keyof typeof STATUS_EMOJIS] || "⏳";
          
          return (
            <div key={vendor.id} className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{vendor.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{vendor.category.replace("_", " ")}</p>
                  </div>
                </div>
                <span className="text-lg">{emoji}</span>
              </div>
              {vendor.deliveryTime && (
                <p className="text-xs text-gray-600 mt-2">Delivery: {vendor.deliveryTime}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
