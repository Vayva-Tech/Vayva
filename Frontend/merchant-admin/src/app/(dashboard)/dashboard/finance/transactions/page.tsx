"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowCounterClockwise as RefreshCcw,
  DownloadSimple as Download,
  X,
  Funnel as Filter,
} from "@phosphor-icons/react/ssr";
import { Button, Icon, Input, Select } from "@vayva/ui";
import { MobileTransactionCard } from "@/components/transactions/MobileTransactionCard";
import { Transaction, TransactionsResponse } from "@/types/finance";
import { apiJson } from "@/lib/api-client-shared";

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    void fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;

    if (statusFilter !== "all") {
      result = result.filter((t) => (t as any).status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateRange === "today") {
        result = result.filter((t) => new Date(t.date) >= today);
      } else if (dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter((t) => new Date(t.date) >= weekAgo);
      } else if (dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        result = result.filter((t) => new Date(t.date) >= monthAgo);
      }
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.reference?.toLowerCase().includes(lowerQuery) ||
          t.amount?.toString().includes(lowerQuery) ||
          (t.provider && t.provider?.toLowerCase().includes(lowerQuery)),
      );
    }

    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [transactions, statusFilter, typeFilter, dateRange, searchQuery]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiJson<TransactionsResponse>(
        "/api/finance/transactions?limit=200",
      );
      setTransactions(data?.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_TRANSACTIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvData = filteredTransactions.map((tx) => ({
      Date: new Date(tx.date).toLocaleString(),
      Type: tx.type,
      Reference: tx.reference,
      Amount: tx.amount,
      Currency: tx.currency,
      Status: (tx as any).status,
      Provider: tx.provider,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((h) => row[h as keyof typeof row]).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported successfully");
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange("all");
  };

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || dateRange !== "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Transactions
          </h1>
          <p className="text-text-tertiary">
            Real-time ledger of all payments and refunds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={loading || filteredTransactions.length === 0}
            variant="outline"
            className="h-9 px-3 text-text-secondary bg-background/70 backdrop-blur-xl border-border hover:bg-background/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={fetchTransactions}
            disabled={loading}
            variant="outline"
            size="icon"
            className="h-9 w-9 text-text-tertiary hover:text-text-secondary bg-background/70 backdrop-blur-xl border-border hover:bg-background/90"
            title="Refresh"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Icon
              name="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary"
            />
            <Input type="text"
              placeholder="Search by reference, amount, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target?.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              aria-label="Search transactions"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary h-7 w-7"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <span className="text-sm font-medium text-text-secondary">Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target?.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target?.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Types</option>
            <option value="CHARGE">Sales</option>
            <option value="PAYOUT">Payouts</option>
            <option value="REFUND">Refunds</option>
          </Select>

          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target?.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </Select>

          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="ghost"
              className="h-8 px-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}

          <div className="ml-auto text-sm text-text-tertiary">
            {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Receipt" className="h-8 w-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No transactions yet
            </h3>
            <p className="text-text-tertiary mb-4">
              Your payment transactions will appear here once customers start
              making purchases.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No matching transactions
            </h3>
            <p className="text-text-tertiary mb-4">
              Try adjusting your filters to see more results.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {filteredTransactions
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((tx) => (
                  <MobileTransactionCard
                    key={tx.id}
                    transaction={tx}
                    onClick={() => setSelectedTransaction(tx)}
                  />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background/40 backdrop-blur-sm text-text-secondary font-medium border-b border-border/40">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )
                    .map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/60 cursor-pointer"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                          <span className="text-text-tertiary text-xs ml-2">
                            {new Date(tx.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <TypeBadge type={tx.type} />
                        </td>
                        <td className="px-6 py-4 font-mono text-text-tertiary">
                          {tx.reference}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {formatCurrency(tx.amount, tx.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${tx.status === "SUCCESS"
                                ? "bg-success/10 text-success"
                                : (tx as any).status === "FAILED"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/10 text-warning"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTransactions.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredTransactions.length,
                  )}{" "}
                  of {filteredTransactions.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="h-8 px-3 text-sm"
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.ceil(
                          filteredTransactions.length / itemsPerPage,
                        ),
                      },
                      (_, i) => i + 1,
                    )
                      .filter((page) => {
                        // Show first, last, current, and adjacent pages
                        const totalPages = Math.ceil(
                          filteredTransactions.length / itemsPerPage,
                        );
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-text-tertiary">...</span>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 rounded text-sm font-medium p-0 ${
                              currentPage === page
                                ? "bg-text-primary text-text-inverse hover:bg-text-primary/90"
                                : "text-text-secondary hover:bg-muted"
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(filteredTransactions.length / itemsPerPage),
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredTransactions.length / itemsPerPage)
                    }
                    variant="outline"
                    className="h-8 px-3 text-sm"
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedTransaction(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaction-modal-title"
        >
          <div
            className="bg-background/70 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background/70 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
              <h2
                id="transaction-modal-title"
                className="text-xl font-bold text-text-primary"
              >
                Transaction Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransaction(null)}
                className="h-9 w-9 hover:bg-muted rounded-lg"
                aria-label="Close transaction details"
              >
                <X className="h-5 w-5 text-text-tertiary" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${selectedTransaction.status === "SUCCESS"
                    ? "bg-success/10 border border-success/20"
                    : (selectedTransaction as any).status === "FAILED"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-warning/10 border border-warning/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Status</p>
                    <p
                      className={`text-lg font-bold ${selectedTransaction.status === "SUCCESS"
                          ? "text-success"
                          : (selectedTransaction as any).status === "FAILED"
                            ? "text-destructive"
                            : "text-warning"
                      }`}
                    >
                      {selectedTransaction.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-secondary">Amount</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatCurrency(
                        selectedTransaction.amount,
                        selectedTransaction.currency,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Reference
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-text-primary flex-1">
                      {selectedTransaction.reference}
                    </p>
                    <Button
                      onClick={() => {navigator?.clipboard?.writeText(
                          selectedTransaction.reference,
                        );
                        toast.success("Reference copied to clipboard");
                      }}
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      aria-label="Copy reference to clipboard"
                    >
                      <Icon name="Copy" className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Type
                  </p>
                  <TypeBadge type={selectedTransaction.type} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Date & Time
                  </p>
                  <p className="text-sm text-text-primary">
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Provider
                  </p>
                  <p className="text-sm text-text-primary capitalize">
                    {selectedTransaction.provider}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/40">
                <Button
                  onClick={() => {navigator?.clipboard?.writeText(
                      selectedTransaction.reference,
                    );
                    toast.success("Reference copied to clipboard");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Reference
                </Button>
                <Button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 bg-text-primary text-text-inverse hover:bg-text-primary/90"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === "CHARGE") {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-secondary">
        <div className="p-1 bg-success/10 text-success rounded">
          <ArrowDownLeft className="h-3 w-3" />
        </div>
        Sale
      </span>
    );
  }
  if (type === "REFUND") {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-secondary">
        <div className="p-1 bg-destructive/10 text-destructive rounded">
          <ArrowUpRight className="h-3 w-3" />
        </div>
        Refund
      </span>
    );
  }
  return <span className="text-text-tertiary">{type}</span>;
}
