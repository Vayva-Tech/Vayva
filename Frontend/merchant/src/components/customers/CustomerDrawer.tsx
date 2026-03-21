import React, { useState, useEffect } from "react";
import { Button, Drawer, Icon, IconName, cn, Modal } from "@vayva/ui";
import {
  Customer,
  CustomerInsight,
  CustomerActivity,
  logger,
  formatCurrency,
  formatDate,
} from "@vayva/shared";
import { WhatsAppAction } from "./WhatsAppAction";
import { CustomerForm } from "./CustomerForm";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";

interface CustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

interface CustomerStats {
  aov: number;
  totalOrders?: number;
  totalSpend?: number;
}

interface CustomerProfileResponse {
  profile: Customer;
  insights: CustomerInsight[];
  stats: CustomerStats;
}

export const CustomerDrawer = ({
  isOpen,
  onClose,
  customerId,
}: CustomerDrawerProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [history, setHistory] = useState<CustomerActivity[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "notes">("timeline");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (isOpen && customerId) {
      void fetchData(controller.signal);
    } else {
      setCustomer(null);
      setInsights([]);
      setHistory([]);
    }
    return () => controller.abort();
  }, [isOpen, customerId]);

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        apiJson<CustomerProfileResponse>(`/api/customers/${customerId}`, {
          signal,
        }),
        apiJson<CustomerActivity[]>(`/api/customers/${customerId}/history`, {
          signal,
        }),
      ]);

      setCustomer(profileRes.profile || null);
      setInsights(profileRes.insights || []);
      setStats(profileRes.stats || null);
      setHistory(historyRes || []);
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      if (e instanceof DOMException && e.name === "AbortError") return;
      logger.error("[FETCH_CUSTOMER_DRAWER_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    setIsDeleting(true);
    try {
      await apiJson<{ success: boolean }>(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      toast.success("Customer deleted successfully");
      onClose();
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[DELETE_CUSTOMER_ERROR]", {
        error: _errMsg,
        customerId: customer.id,
        app: "merchant",
      });
      toast.error(_errMsg || "An error occurred while deleting the customer");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Customer Profile">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && <p>Loading customer details...</p>}
        {isDeleting && <p>Deleting customer...</p>}
        {customer && <p>Customer profile loaded for {customer.name}</p>}
      </div>
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void handleDelete();
        }}
        title="Delete customer?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
      {loading || !customer ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex flex-col h-full bg-white/40">
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 border border-gray-100">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {customer.name}
                  </h2>
                  <p className="text-gray-400 text-sm font-mono flex items-center gap-2">
                    <Icon name="Phone" size={12} /> {customer.phone}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {insights.some(
                      (i: CustomerInsight) => i.type === "risk",
                    ) && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        High Risk
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-white/40 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Seen {new Date(customer.lastSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-9 w-9 p-0 rounded-full"
                  title="Edit Profile"
                >
                  <Icon name="Edit3" size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isDeleting}
                  className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-100"
                  title="Delete Customer"
                >
                  {isDeleting ? (
                    <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full" />
                  ) : (
                    <Icon name="Trash2" size={14} />
                  )}
                </Button>
                <WhatsAppAction
                  phone={customer.phone}
                  name={customer.name}
                  label="Message"
                  size="sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                  Lifetime Value
                </p>
                <p className="text-lg font-bold font-mono">
                  {formatCurrency(customer.totalSpend)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                  Orders
                </p>
                <p className="text-lg font-bold">{customer.totalOrders}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                  AOV
                </p>
                <p className="text-lg font-bold font-mono">
                  {formatCurrency(stats?.aov || 0)}
                </p>
              </div>
            </div>
          </div>

          {insights.length > 0 && (
            <div className="bg-white p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center gap-1">
                <Icon name="Sparkles" size={12} className="text-amber-500" />{" "}
                Smart Insights
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="min-w-[200px] p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        name={insight.icon as IconName}
                        size={14}
                        className="text-green-500"
                      />
                      <span className="text-xs font-bold text-gray-900">
                        {insight.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto p-6">
            <div className="flex gap-4 border-b border-gray-100 mb-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "pb-2 text-sm font-bold transition-colors rounded-none hover:bg-transparent h-auto p-0 hover:no-underline",
                  activeTab === "timeline"
                    ? "border-b-2 border-text-green-500 text-gray-900"
                    : "text-gray-400 hover:text-gray-500",
                )}
              >
                History
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("notes")}
                className={cn(
                  "pb-2 text-sm font-bold transition-colors rounded-none hover:bg-transparent h-auto p-0 hover:no-underline",
                  activeTab === "notes"
                    ? "border-b-2 border-text-green-500 text-gray-900"
                    : "text-gray-400 hover:text-gray-500",
                )}
              >
                Notes
              </Button>
            </div>

            {activeTab === "timeline" && (
              <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
                {history.map((item: CustomerActivity) => (
                  <div key={item.id} className="relative pl-6">
                    <div
                      className={cn(
                        "absolute -left-[25px] top-0 w-8 h-8 rounded-full border-4 border-gray-100 flex items-center justify-center bg-white shadow-sm",
                        item.type === "order"
                          ? "text-blue-600"
                          : item.type === "message"
                            ? "text-green-600"
                            : "text-gray-400",
                      )}
                    >
                      <Icon
                        name={
                          (item.type === "order"
                            ? "ShoppingBag"
                            : item.type === "message"
                              ? "MessageCircle"
                              : "FileText") as IconName
                        }
                        size={14}
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase text-gray-400">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {item.description}
                      </div>
                      {item.amount && (
                        <div className="mt-2 font-mono font-bold text-gray-900">
                          {formatCurrency(item.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="text-center py-10 text-gray-400">
                <Icon
                  name="FileText"
                  size={32}
                  className="mx-auto mb-2 opacity-20"
                />
                <p className="text-sm">No internal notes yet.</p>
                <Button size="sm" variant="outline" className="mt-4">
                  Add Note
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile"
      >
        <CustomerForm
          initialData={customer as any}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </Drawer>
  );
};
