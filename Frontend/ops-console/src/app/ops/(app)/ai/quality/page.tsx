"use client";

import React, { useState } from "react";
import { Robot, ThumbsUp, ThumbsDown, ArrowCounterClockwise as RefreshCw, Chat as MessageSquare } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Store {
  name: string;
}

interface FeedbackItem {
  id: string;
  rating: "SOLVED" | "NOT_SOLVED";
  store: Store;
  reason: string;
  conversationId: string;
  createdAt: string;
}

export default function AiQualityPage(): React.JSX.Element {
  const [filter, setFilter] = useState("ALL");
  const {
    data: feedbacks,
    isLoading,
    refetch,
  } = useOpsQuery<FeedbackItem[]>(["ai-feedback", filter], () =>
    fetch(`/api/ops/ai/feedback?rating=${filter}`).then((res: any) =>
      res.json().then((j: any) => j.data),
    ),
  );

  return (
    <OpsPageShell
      title="AI Quality Lab"
      description="Review merchant feedback on automated responses"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh AI feedback list"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {["ALL", "SOLVED", "NOT_SOLVED"].map((s: any) => (
          <Button
            key={s}
            variant={filter === s ? "secondary" : "ghost"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors h-auto ${filter === s ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "text-gray-600 hover:bg-white/60"}`}
            aria-label={`Filter by ${s === "ALL" ? "all feedback" : s === "SOLVED" ? "positive feedback" : "negative feedback"}`}
          >
            {s === "ALL"
              ? "All Feedback"
              : s === "SOLVED"
                ? "👍 Positive"
                : "👎 Negative"}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Sentiment</th>
              <th className="px-6 py-3 font-medium">Merchant</th>
              <th className="px-6 py-3 font-medium">Reason</th>
              <th className="px-6 py-3 font-medium">Conversation ID</th>
              <th className="px-6 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading feedback...
                </td>
              </tr>
            ) : !feedbacks?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  No feedback found.
                </td>
              </tr>
            ) : (
              feedbacks.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    {item.rating === "SOLVED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                        <ThumbsUp size={12} /> Positive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                        <ThumbsDown size={12} /> Negative
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.store?.name || "Unknown Store"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.reason || (
                      <span className="text-gray-300 italic">
                        No reason provided
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600">
                    {item.conversationId}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
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
