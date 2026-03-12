"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Eye, PaperPlaneRight as Send } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { cn, Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

// Interface for campaign data
interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: "SENT" | "SCHEDULED" | "DRAFT";
  scheduledAt: string | null;
}

const statusFilters = ["DRAFT", "SCHEDULED", "SENT", "ALL"] as const;
type StatusFilter = typeof statusFilters[number];

export default function CampaignManagerPage(): React.JSX.Element {
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  const { data: campaigns, isLoading } = useOpsQuery<Campaign[]>(
    ["ops-campaigns", filter],
    () =>
      fetch(`/api/ops/growth/campaigns?status=${filter}`).then((res: Response) =>
        res.json().then((j: { data: Campaign[] }) => j.data),
      ),
  );

  return (
    <OpsPageShell
      title="Campaign Manager"
      description="Design and schedule cross-platform customer lifecycle messaging"
      headerActions={
        <Button className="font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg active:scale-95 h-auto">
          <Plus size={20} /> New Campaign
        </Button>
      }
    >

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {statusFilters.map((s: StatusFilter) => (
          <Button
            key={s}
            onClick={() => setFilter(s)}
            variant="ghost"
            className={cn(
              "px-4 py-2 text-sm font-bold border-b-2 transition-colors -mb-2 rounded-none hover:bg-transparent h-auto",
              filter === s
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Campaign Name</th>
              <th className="px-6 py-3 font-medium">Channel</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Scheduled</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading campaigns...
                </td>
              </tr>
            ) : !campaigns?.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-gray-400 font-medium"
                >
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign: Campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-white/60 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {campaign.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      #{campaign.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">
                      {campaign.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                        campaign.status === "SENT"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                    {campaign.scheduledAt
                      ? new Date(campaign.scheduledAt).toLocaleString()
                      : "Manual only"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="View Preview"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Send Now"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
