"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { ArrowLeft, User, PaperPlane as Send, CheckCircle, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface SupportTicket {
  id: string;
  subject: string;
  status?: string;
  storeName?: string;
  storeSlug?: string;
  storeId?: string;
  storeStatus?: string;
  storeTier?: string;
  createdAt: string;
  description?: string | null;
  summary?: string | null;
  initialMessage?: string | null;
}

export default function SupportDetailPage(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const {
    data: ticket,
    isLoading,
    refetch,
  } = useOpsQuery<SupportTicket>(["support-ticket", id], () =>
    fetch(`/api/ops/support/${id}`).then((res) =>
      res.json().then((j) => j.data),
    ),
  );

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/ops/support/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(`Ticket marked as ${newStatus}`);
        refetch();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = reply.trim();
    if (!message) return;

    setSending(true);
    try {
      const res = await fetch(`/api/ops/support/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error || "Failed to send reply");
        return;
      }

      setReply("");
      toast.success("Reply sent");
      refetch();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-gray-400">
        Loading ticket details...
      </div>
    );
  if (!ticket)
    return (
      <div className="p-12 text-center text-red-500">Ticket not found</div>
    );

  return (
    <OpsPageShell
      title={`#${ticket?.id?.slice(0, 6)} ${ticket.subject}`}
      description={ticket.storeName || "Merchant"}
      headerActions={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="rounded-full h-9 w-9"
            aria-label="Refresh ticket"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {((ticket.status || "")).toLowerCase() !== "resolved" ? (
            <Button
              onClick={() => handleStatusUpdate("RESOLVED")}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 h-9"
            >
              <CheckCircle size={16} /> Mark Resolved
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => handleStatusUpdate("OPEN")}
              className="h-9"
            >
              Re-open Ticket
            </Button>
          )}
        </div>
      }
    >

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Search / Chat Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
            {/* Initial Message */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-gray-500" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900">
                    {ticket.storeName || "Merchant"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 bg-white border border-gray-200 p-4 rounded-r-xl rounded-bl-xl text-sm text-gray-800 shadow-sm">
                  <p className="font-medium mb-1">{ticket.subject}</p>
                  <p className="text-gray-600">
                    {ticket.description || ticket.summary || ticket.initialMessage || "No additional details provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Box */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendReply} className="relative">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target?.value)}
                placeholder="Type your reply..."
                className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !reply.trim()}
                className="absolute bottom-3 right-3 h-8 w-8"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="w-80 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Merchant Context
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                {ticket.storeName?.[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {ticket.storeName}
                </div>
                <div className="text-xs text-gray-500">{ticket.storeSlug}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  ticket.storeStatus === "ACTIVE" 
                    ? "bg-green-100 text-green-700" 
                    : ticket.storeStatus === "SUSPENDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                }`}>
                  {ticket.storeStatus || "UNKNOWN"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tier</span>
                <span className="font-medium">{ticket.storeTier || "Free"}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={`/ops/merchants/${ticket.storeId}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
              >
                View Merchant Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </OpsPageShell>
  );
}
