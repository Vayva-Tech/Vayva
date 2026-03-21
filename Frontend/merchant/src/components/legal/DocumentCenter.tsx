"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { FileText, Signature } from "@phosphor-icons/react";
import type { DocumentCenterMetrics } from "@/types/legal";

interface DocumentCenterProps {
  data?: DocumentCenterMetrics;
}

export function DocumentCenter({ data }: DocumentCenterProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-purple-700 shadow-lg  bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={24} className="text-purple-700" />
        <h2 className="text-xl font-bold text-gray-900">Document Center</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{data.drafting}</div>
          <div className="text-xs text-blue-700">Drafting</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-900">{data.inReview}</div>
          <div className="text-xs text-orange-700">In Review</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">{data.awaitingSignature}</div>
          <div className="text-xs text-purple-700">Awaiting Signature</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-900">{data.executedFiled}</div>
          <div className="text-xs text-green-700">Executed/Filed</div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <Signature size={14} /> E-Signature Pending
          </span>
          <span className="font-semibold text-gray-900">{data.eSignaturePending}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Template Library</span>
          <span className="font-semibold text-gray-900">{data.templateCount}</span>
        </div>
      </div>
    </Card>
  );
}
