"use client";

import { logger, formatDate } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Icon, Button, cn, Textarea } from "@vayva/ui";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

import { apiJson } from "@/lib/api-client-shared";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Approvals Queue</h1>
        <p className="text-text-tertiary">
          Review and authorize sensitive actions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors h-auto hover:bg-transparent",
            activeTab === "pending"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-tertiary hover:text-text-primary hover:border-border",
          )}
        >
          Pending Reviews
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors h-auto hover:bg-transparent",
            activeTab === "history"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-tertiary hover:text-text-primary hover:border-border",
          )}
        >
          History
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-10 text-text-tertiary flex items-center justify-center gap-2" aria-live="polite" role="status">
            <Loader2 className="animate-spin h-5 w-5" /> Loading approvals...
            <span className="sr-only">Loading approvals...</span>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-20 bg-background/30 rounded-xl border border-dashed border-border">
            <p className="text-text-tertiary font-medium">
              No {activeTab} approvals found.
            </p>
          </div>
        )}

        {!loading &&
          items.map((item) => (
            <motion.div
              layoutId={item.id}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === "pending"
                      ? "bg-primary/10 text-primary"
                      : (item as any).status === "approved" || (item as any).status === "executed"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {item.status === "pending" && <Icon name="Clock" size={20} />}
                  {((item as any).status === "approved" ||
                    (item as any).status === "executed") && (
                    <Icon name="CheckCircle" size={20} />
                  )}
                  {((item as any).status === "rejected" || (item as any).status === "failed") && (
                    <Icon name="XCircle" size={20} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-text-primary capitalize">
                      {item?.actionType?.replace(".", " ")}
                    </h3>
                    {item.entityType && (
                      <span className="px-1.5 py-0.5 bg-background/30 text-text-tertiary text-[10px] rounded uppercase font-medium">
                        {item.entityType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Requested by{" "}
                    <span className="text-text-primary font-medium">
                      {item.requestedByLabel}
                    </span>{" "}
                    &bull; {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {item.status === "pending" && (
                  <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    Pending
                  </div>
                )}
                {activeTab === "history" && (
                  <span
                    className={`text-xs font-bold uppercase ${item.status === "executed"
                        ? "text-success"
                        : (item as any).status === "failed"
                          ? "text-destructive"
                          : (item as any).status === "rejected"
                            ? "text-text-tertiary"
                            : "text-text-tertiary"
                    }`}
                  >
                    {item.status}
                  </span>
                )}

                <Icon
                  name="ChevronRight"
                  size={16}
                  className="text-text-tertiary group-hover:text-text-primary transition-colors"
                />
              </div>
            </motion.div>
          ))}
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
              className="fixed inset-0 bg-background/80 z-40"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-[480px] bg-background/70 backdrop-blur-xl z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-background/30">
                <div>
                  <h2 className="text-lg font-bold">Request Details</h2>
                  <p className="text-xs text-text-tertiary font-mono mt-1">
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
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-xs font-bold text-warning/90 uppercase mb-1">
                      Requester Note
                    </p>
                    <p className="text-sm text-warning">
                      {selectedItem.reason}
                    </p>
                  </div>
                )}

                {/* Payload */}
                <div>
                  <p className="text-xs font-bold text-text-tertiary uppercase mb-2">
                    Payload Data
                  </p>
                  <div className="bg-text-primary text-text-tertiary p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    <pre>{JSON.stringify(selectedItem.payload, null, 2)}</pre>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background/30 rounded-lg">
                    <p className="text-[10px] uppercase text-text-tertiary font-bold">
                      Requested By
                    </p>
                    <p className="text-sm font-medium">
                      {selectedItem.requestedByLabel}
                    </p>
                  </div>
                  <div className="p-3 bg-background/30 rounded-lg">
                    <p className="text-[10px] uppercase text-text-tertiary font-bold">
                      Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(selectedItem.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Decision Info */}
                {selectedItem.status !== "pending" && (
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">
                      Decision
                    </p>
                    <div className="p-3 bg-background/30 rounded-lg border border-border/40">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold capitalize">
                          {selectedItem.status}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          by {selectedItem.decidedByLabel || "System"}
                        </span>
                      </div>
                      {selectedItem.decisionReason && (
                        <p className="text-sm text-text-secondary mt-2 italic">
                          "{selectedItem.decisionReason}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {selectedItem.status === "pending" && (
                <div className="p-6 border-t border-border/40 bg-background/30 flex flex-col gap-4">
                  <Textarea
                    placeholder="Add a note (optional)..."
                    className="w-full border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none h-20"
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
                      className="flex-1 py-6 border-border bg-background/70 backdrop-blur-xl text-destructive font-bold rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleDecision("approve")}
                      disabled={actionLoading}
                      className="flex-1 py-6 bg-primary text-text-inverse font-bold rounded-lg hover:bg-primary/90"
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
