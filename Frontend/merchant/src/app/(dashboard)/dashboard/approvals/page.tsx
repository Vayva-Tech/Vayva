"use client";
import { logger, formatDate } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Textarea, Icon } from "@vayva/ui";
import { CheckCircle, XCircle, ClockCounterClockwise, FileText, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

type ApprovalRequest = {
  id: string;
  actionType: string;
  requestedByLabel: string;
  createdAt: string;
    payload: any;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  reason?: string;
  decisionReason?: string;
  decidedByLabel?: string;
  entityType?: string;
  entityId?: string;
};

interface ApprovalsResponse {
  items: ApprovalRequest[];
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ApprovalRequest | null>(
    null,
  );

  // Decide Reason Input
  const [decisionReason, setDecisionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async (signal?: AbortSignal) => {
    setLoading(true);
    // status=pending or status=all depending on tab.
    const status = activeTab === "pending" ? "pending" : "all";
    try {
      const res = await apiJson<ApprovalsResponse>(
        `/api/merchant/approvals?status=${status}&limit=50`,
        { signal },
      );
      setItems(res.items || []);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      if (err instanceof DOMException && err.name === "AbortError") return;
      logger.error("[FETCH_APPROVALS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchItems(controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab]);

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await apiJson<{ success: boolean }>(
        `/api/merchant/approvals/${selectedItem.id}/${decision}`,
        {
          method: "POST",
          body: JSON.stringify({ decisionReason }),
        },
      );
      // Success
      setSelectedItem(null);
      setDecisionReason("");
      void fetchItems();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[HANDLE_DECISION_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate metrics
  const totalRequests = items.length;
  const pending = items.filter(i => i.status === 'pending').length;
  const approved = items.filter(i => i.status === 'approved' || i.status === 'executed').length;
  const rejected = items.filter(i => i.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Approvals Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review and authorize sensitive actions</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Total Requests"
          value={String(totalRequests)}
          trend={`${pending} pending`}
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Pending"
          value={String(pending)}
          trend="needs review"
          positive={pending === 0}
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Approved"
          value={String(approved)}
          trend="authorized"
          positive
        />
        <SummaryWidget
          icon={<XCircle size={18} />}
          label="Rejected"
          value={String(rejected)}
          trend="declined"
          positive
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
        <Button
          onClick={() => setActiveTab("pending")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            activeTab === "pending"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending
        </Button>
        <Button
          onClick={() => setActiveTab("history")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            activeTab === "history"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          History
        </Button>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No approval requests</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {activeTab === "pending" 
                ? "When team members request approvals, they will appear here." 
                : "Approval history will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {item.actionType}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'pending'
                            ? "bg-orange-50 text-orange-600"
                            : item.status === 'approved' || item.status === 'executed'
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.payload?.title || item.actionType}</h3>
                    <p className="text-sm text-gray-500">
                      Requested by {item.requestedByLabel} • {formatDate(item.createdAt)}
                    </p>
                    {item.reason && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600"><span className="font-semibold">Reason:</span> {item.reason}</p>
                      </div>
                    )}
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => { setSelectedItem(item); handleDecision('approve'); }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 h-9 rounded-xl font-semibold"
                      >
                        <CheckCircle size={16} className="mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => { setSelectedItem(item); handleDecision('reject'); }}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 px-4 h-9 rounded-xl font-semibold"
                      >
                        <XCircle size={16} className="mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-40"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-[480px] bg-white  z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-lg font-bold">Request Details</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {selectedItem.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-full hover:bg-border"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Reason Card */}
                {selectedItem.reason && (
                  <div className="p-4 bg-amber-50 border border-amber-500/20 rounded-lg">
                    <p className="text-xs font-bold text-amber-600/90 uppercase mb-1">
                      Requester Note
                    </p>
                    <p className="text-sm text-amber-600">
                      {selectedItem.reason}
                    </p>
                  </div>
                )}

                {/* Payload */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Payload Data
                  </p>
                  <div className="bg-text-green-600 text-gray-500 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    <pre>{JSON.stringify(selectedItem.payload, null, 2)}</pre>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">
                      Requested By
                    </p>
                    <p className="text-sm font-medium">
                      {selectedItem.requestedByLabel}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">
                      Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(selectedItem.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Decision Info */}
                {selectedItem.status !== "pending" && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Decision
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold capitalize">
                          {selectedItem.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {selectedItem.decidedByLabel || "System"}
                        </span>
                      </div>
                      {selectedItem.decisionReason && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{selectedItem.decisionReason}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {selectedItem.status === "pending" && (
                <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-4">
                  <Textarea
                    placeholder="Add a note (optional)..."
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none h-20"
                    value={decisionReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDecisionReason(e.target?.value)
                    }
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDecision("reject")}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1 py-6 border-gray-200 bg-white  text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-red-500 hover:border-red-500/20"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleDecision("approve")}
                      disabled={actionLoading}
                      className="flex-1 py-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-500"
                    >
                      {actionLoading ? "Processing..." : "Approve & Execute"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
