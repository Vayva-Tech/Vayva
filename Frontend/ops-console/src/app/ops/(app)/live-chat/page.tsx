"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Chat as MessageSquare, PauseCircle, CheckCircle, Warning as AlertTriangle } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Handoff {
  id: string;
  storeName: string;
  customerPhone: string;
  trigger: string;
  aiSummary?: string;
  ticketStatus: string;
}

export default function LiveChatPage(): React.JSX.Element {
  const { data: handoffs, isLoading } = useOpsQuery<Handoff[]>(
    ["ai-handoffs"],
    () =>
      fetch("/api/ops/ai/handoffs").then((res: any) =>
        res.json().then((j: any) => j.data),
      ),
  );

  const handlePauseAi = async (id: string, phone: string) => {
    if (!confirm(`Pause AI for ${phone}? This will stop auto-replies.`)) return;

    try {
      const res = await fetch("/api/ops/ai/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, handoffId: id }),
      });

      if (!res.ok) {
        throw new Error("Failed to pause AI");
      }

      toast.success("AI Agent paused for " + phone);
    } catch {
      toast.error("Failed to pause AI");
    }
  };

  return (
    <OpsPageShell
      title="AI Live Supervisor"
      description="Monitor active conversations requiring human intervention"
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Store</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Trigger</th>
              <th className="px-6 py-4 font-medium">AI Summary</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  Scanning active channels...
                </td>
              </tr>
            ) : !handoffs?.length ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  No active handoff requests. AI is handling everything!
                </td>
              </tr>
            ) : (
              handoffs?.map((h: any) => (
                <tr key={h.id} className="hover:bg-white/60">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {h.storeName}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    {h.customerPhone}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                      {h.trigger}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-gray-600 max-w-xs truncate"
                    title={h.aiSummary}
                  >
                    {h.aiSummary || "No summary available"}
                  </td>
                  <td className="px-6 py-4">
                    {h.ticketStatus === "OPEN" ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle size={12} /> Needs Action
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Resolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handlePauseAi(h.id, h.customerPhone)}
                      className="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1 justify-end w-full h-auto p-0 hover:bg-transparent"
                      aria-label={`Pause AI agent for customer ${h.customerPhone}`}
                    >
                      <PauseCircle size={14} /> Pause AI
                    </Button>
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
