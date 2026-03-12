"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { ArrowLeft, ArrowCounterClockwise as RefreshCw, WarningCircle as AlertCircle, CheckCircle, Clock } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

export default function WebhookDetailPage(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const [replaying, setReplaying] = useState(false);

  const {
    data: webhook,
    isLoading,
    refetch,
  } = useOpsQuery(["webhook", id], async () => {
    const res = await fetch(`/api/ops/webhooks/${id}`);
    if (res.status === 401) { window.location.href = "/ops/login"; return; }
    if (!res.ok) throw new Error("Failed to load webhook");
    const json = await res.json();
    return json.data;
  });

  const handleReplay = async () => {
    if (
      !confirm(
        "Are you sure you want to replay this webhook event? It will be reset to PENDING.",
      )
    )
      return;

    setReplaying(true);
    try {
      const res = await fetch(`/api/ops/webhooks/${id}/replay`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok) {
        toast.success("Replay Triggered", {
          description: "WebhookLogo as Webhook status reset to received.",
        });
        refetch();
      } else {
        toast.error("Replay Failed", {
          description: json.error || "Unknown error",
        });
      }
    } catch {
      toast.error("Network Error");
    } finally {
      setReplaying(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-gray-500">Loading webhook...</div>
    );
  if (!webhook)
    return (
      <div className="p-12 text-center text-red-500">WebhookLogo as Webhook not found</div>
    );

  const statusColor =
    {
      PROCESSED: "text-green-700 bg-green-100",
      FAILED: "text-red-700 bg-red-100",
      RECEIVED: "text-blue-700 bg-blue-100",
    }[webhook.status as "PROCESSED" | "FAILED" | "RECEIVED"] ||
    "text-gray-700 bg-gray-100";

  return (
    <OpsPageShell
      title={webhook.eventType}
      description={webhook.id}
      headerActions={
        <Button
          onClick={handleReplay}
          disabled={replaying}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={replaying ? "animate-spin" : ""} />
          Replay Event
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/ops/webhooks"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 gap-1"
        >
          <ArrowLeft size={16} /> Back to Webhooks
        </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Metadata */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
              Meta
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Provider</dt>
                <dd className="font-medium text-gray-900 capitalize">
                  {webhook.provider}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Store</dt>
                <dd className="font-medium text-indigo-600">
                  <Link href={`/ops/merchants/${webhook.storeId}`}>
                    {webhook.storeName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Received At</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(webhook.receivedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Processed At</dt>
                <dd className="font-medium text-gray-900">
                  {webhook.processedAt
                    ? new Date(webhook.processedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {webhook.error && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <AlertCircle size={16} /> Error
              </h3>
              <p className="text-sm text-red-700 font-mono break-words">
                {webhook.error}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Payload */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-mono text-gray-500 uppercase">
              Payload Body
            </div>
            <div className="flex-1 p-4 bg-gray-900 overflow-auto">
              <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                {JSON.stringify(webhook.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      </div>
    </OpsPageShell>
  );
}
