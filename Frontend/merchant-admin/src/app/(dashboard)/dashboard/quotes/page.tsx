"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Button } from "@vayva/ui";
import {
  Plus,
  FileText,
  Bank as Building2,
  Clock,
  CurrencyCircleDollar as DollarSign,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import { toast } from "sonner";

import { Quote, QuotesResponse } from "@/types/quotes";

import { apiJson } from "@/lib/api-client-shared";
import { StatusBadge } from "@/components/shared";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const controller = new AbortController();
    void fetchQuotes(controller);
    return () => controller.abort();
  }, [filter]);

  const fetchQuotes = async (controller?: AbortController) => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?status=${filter}` : "";
      const data = await apiJson<QuotesResponse>(`/api/quotes${params}`, {
        signal: controller?.signal,
      });
      setQuotes(data.quotes || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      if (error instanceof DOMException && error.name === "AbortError") return;
      logger.error("[FETCH_QUOTES_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to fetch quotes");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiJson<{ success: boolean }>(`/api/quotes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Quote ${status.toLowerCase()}`);
      void fetchQuotes();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPDATE_QUOTE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to update quote");
    }
  };


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotes & Orders</h1>
          <p className="text-text-tertiary">
            Manage B2B quotes and purchase orders.
          </p>
        </div>
        <Button className="bg-vayva-green text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Quote
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "PENDING", "CONFIRMED", "COMPLETED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-border border-t-black rounded-full mx-auto" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="font-semibold text-text-primary">No quotes yet</h3>
            <p className="text-text-tertiary text-sm mt-1">
              Create your first B2B quote to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="p-4 hover:bg-background/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary">
                          {quote.quoteNumber}
                        </h3>
                        <StatusBadge status={quote.status} />
                      </div>
                      <p className="text-sm text-text-secondary">
                        {quote.companyName}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(quote.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(quote.total, "NGN")}
                        </span>
                        <span>{quote.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quote.status?.toUpperCase() === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(quote.id, "CONFIRMED")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(quote.id, "CANCELLED")}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
