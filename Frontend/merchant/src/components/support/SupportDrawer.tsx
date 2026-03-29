"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Drawer, Icon, Input, Textarea, type IconName } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface SupportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    type?: string;
    orderId?: string;
    paymentId?: string;
  };
}

type SupportView = "home" | "self_resolution" | "ticket_form" | "ticket_list";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
}

const CATEGORY_MAP: Record<string, string> = {
  payment: "BILLING",
  order: "TECHNICAL",
  wallet: "BILLING",
  kyc: "ACCOUNT",
  domain: "TECHNICAL",
  other: "OTHER",
};

interface CreateTicketResponse {
  success: boolean;
  ticketId?: string;
}

export const SupportDrawer = ({
  isOpen,
  onClose,
  initialContext,
}: SupportDrawerProps) => {
  const [view, setView] = useState<SupportView>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({ subject: "", description: "" });

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await apiJson<{ items?: Ticket[] } | Ticket[]>(
        "/merchant/support/tickets?limit=20",
      );
      const items = Array.isArray(res) ? res : res.items || [];
      setTickets(items);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_TICKETS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setView("self_resolution");
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setFormError("Subject and description are required.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      await apiJson<CreateTicketResponse>("/support/create", {
        method: "POST",
        body: JSON.stringify({
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          category: CATEGORY_MAP[selectedCategory || "other"] || "OTHER",
        }),
      });
      setFormSuccess(true);
      setFormData({ subject: "", description: "" });
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SUBMIT_TICKET_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setFormError(_errMsg || "Failed to submit ticket.");
    } finally {
      setFormLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "open") return "bg-orange-100 text-orange-700";
    if (s === "resolved" || s === "closed")
      return "bg-green-100 text-green-700";
    return "bg-white/40 text-gray-500";
  };

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white/40 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                How can we help?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <CategoryButton
                  icon="CreditCard"
                  label="Payments"
                  onClick={() => handleCategorySelect("payment")}
                />
                <CategoryButton
                  icon="Package"
                  label="Orders"
                  onClick={() => handleCategorySelect("order")}
                />
                <CategoryButton
                  icon="Wallet"
                  label="Wallet"
                  onClick={() => handleCategorySelect("wallet")}
                />
                <CategoryButton
                  icon="UserCheck"
                  label="KYC"
                  onClick={() => handleCategorySelect("kyc")}
                />
                <CategoryButton
                  icon="Globe"
                  label="Domain"
                  onClick={() => handleCategorySelect("domain")}
                />
                <CategoryButton
                  icon="MoreHorizontal"
                  label="Other"
                  onClick={() => handleCategorySelect("other")}
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setView("ticket_list");
                  fetchTickets();
                }}
              >
                <span>My Tickets</span>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        );

      case "self_resolution":
        return (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("home")}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" /> Back
            </Button>
            <div className="p-4 bg-white/40 rounded-lg space-y-3">
              <h3 className="font-bold text-gray-900">
                Quick tips for {selectedCategory}
              </h3>
              <ul className="text-sm text-gray-500 space-y-2">
                {selectedCategory === "payment" && (
                  <>
                    <li>
                      Check that your payment method is active and has
                      sufficient funds.
                    </li>
                    <li>
                      Verify your KYC status is complete for payout issues.
                    </li>
                  </>
                )}
                {selectedCategory === "order" && (
                  <>
                    <li>Check the order status in your Orders dashboard.</li>
                    <li>
                      Contact the customer directly for delivery disputes.
                    </li>
                  </>
                )}
                {selectedCategory === "wallet" && (
                  <>
                    <li>
                      Wallet withdrawals require completed KYC verification.
                    </li>
                    <li>Check your payout account details in Settings.</li>
                  </>
                )}
                {selectedCategory === "kyc" && (
                  <>
                    <li>Ensure your NIN and BVN are both verified.</li>
                    <li>Registered businesses also need CAC approval.</li>
                  </>
                )}
                {selectedCategory === "domain" && (
                  <>
                    <li>DNS changes can take up to 48 hours to propagate.</li>
                    <li>
                      Ensure your CNAME record points to your Vayva storefront.
                    </li>
                  </>
                )}
                {(selectedCategory === "other" || !selectedCategory) && (
                  <li>
                    Describe your issue below and our team will respond
                    promptly.
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-3">
                Still need help?
              </p>
              <Button
                onClick={() => {
                  setView("ticket_form");
                  setFormSuccess(false);
                  setFormError(null);
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        );

      case "ticket_form":
        if (formSuccess) {
          return (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={28} />
              </div>
              <h3 className="font-bold text-gray-900">Ticket Submitted</h3>
              <p className="text-sm text-gray-400">
                We sent you a confirmation email. Our team will respond shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setView("home");
                  setFormSuccess(false);
                }}
              >
                Back to Support
              </Button>
            </div>
          );
        }
        return (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("self_resolution")}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" /> Back
            </Button>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-500 block mb-1">
                  Subject
                </label>
                <Input type="text"
                  required
                  value={formData.subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Brief summary of your issue"
                  className="w-full p-3 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-green-100 outline-none"
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 block mb-1">
                  Description
                </label>
                <Textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the issue in detail..."
                  className="w-full p-3 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-green-100 outline-none resize-y"
                  disabled={formLoading}
                />
              </div>
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} /> {formError}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </div>
        );

      case "ticket_list":
        return (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("home")}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" /> Back
            </Button>
            {ticketsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-white/40 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Icon
                  name="Inbox"
                  size={32}
                  className="mx-auto mb-2 opacity-40"
                />
                <p className="text-sm">No tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white border border-gray-100 rounded-lg"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {t.subject}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(t.createdAt).toLocaleDateString()} ·{" "}
                      {t.priority?.toLowerCase()} priority
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Support">
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
    </Drawer>
  );
};

const CategoryButton = ({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-lg hover:border-text-green-500 transition-colors"
    variant="outline"
  >
    <Icon name={icon} size={24} className="mb-2 text-gray-500" />
    <span className="text-xs font-medium text-gray-900">{label}</span>
  </Button>
);
