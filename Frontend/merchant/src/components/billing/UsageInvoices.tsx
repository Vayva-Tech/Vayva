"use client";

import React, { useEffect, useState } from "react";
import { Icon, Button, cn } from "@vayva/ui";
import { formatCurrency, formatDate } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  baseAmount: number;
  overageAmount: number;
  totalAmount: number;
  status: string;
  paidAt: string | null;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitCost: number;
    amount: number;
  }>;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING_PAYMENT: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-500 text-red-500",
  CANCELLED: "bg-gray-100 text-gray-600",
  DRAFT: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING_PAYMENT: "Pending",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
};

export function UsageInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ invoices: Invoice[] }>(
        "/merchant/billing/invoices"
      );
      setInvoices(response.invoices);
    } catch (error) {
      console.error("[INVOICES_ERROR]", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  if (loading) {
    return (
      <div className="rounded-[20px] border border-gray-100 bg-white  p-6">
        <div className="flex items-center justify-center py-12">
          <Icon name="Spinner" className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-[20px] border border-gray-100 bg-white  p-6">
        <div className="text-center py-8 text-gray-400">
          <Icon
            name="Receipt"
            size={32}
            className="mx-auto mb-3 text-gray-400/50"
          />
          <p>No invoices yet</p>
          <p className="text-sm mt-1">
            Invoices will appear here at the end of each billing period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Usage-Based Invoices
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvoices}
          className="gap-2"
        >
          <Icon name="ArrowClockwise" size={14} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="rounded-[16px] border border-gray-100 bg-white  overflow-hidden"
          >
            {/* Invoice Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(invoice.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Icon name="Receipt" size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(invoice.periodStart)} -{" "}
                    {formatDate(invoice.periodEnd)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(invoice.totalAmount / 100)}
                  </p>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      STATUS_STYLES[invoice.status] ||
                        "bg-gray-100 text-gray-600"
                    )}
                  >
                    {STATUS_LABELS[invoice.status] || invoice.status}
                  </span>
                </div>
                <Icon
                  name={expandedInvoice === invoice.id ? "CaretUp" : "CaretDown"}
                  size={16}
                  className="text-gray-400"
                />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedInvoice === invoice.id && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Line Items */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Line Items
                  </h4>
                  <div className="space-y-2">
                    {/* Base Plan */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base Plan</span>
                      <span className="text-gray-900">
                        {formatCurrency(invoice.baseAmount / 100)}
                      </span>
                    </div>

                    {/* Overage Items */}
                    {invoice.lineItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500">
                          {item.description}
                          <span className="text-gray-400 ml-1">
                            ({item.quantity.toLocaleString()} @ ₦
                            {(item.unitCost / 100).toFixed(2)})
                          </span>
                        </span>
                        <span className="text-red-500">
                          +{formatCurrency(item.amount / 100)}
                        </span>
                      </div>
                    ))}

                    {invoice.overageAmount > 0 &&
                      (!invoice.lineItems || invoice.lineItems.length === 0) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Usage Overages
                          </span>
                          <span className="text-red-500">
                            +{formatCurrency(invoice.overageAmount / 100)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatCurrency(invoice.totalAmount / 100)}
                  </span>
                </div>

                {/* Actions */}
                {invoice.status === "PENDING_PAYMENT" && (
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      Pay Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Download" size={14} className="mr-1" />
                      PDF
                    </Button>
                  </div>
                )}

                {invoice.status === "PAID" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Download" size={14} className="mr-1" />
                      Download Receipt
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
