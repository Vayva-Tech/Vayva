"use client";
import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownLeft, ArrowsClockwise as RefreshCcw, Download, Funnel as Filter, MagnifyingGlass as Search, CurrencyDollar as DollarSign, ClockCounterClockwise, CheckCircle, TrendUp, X, Copy } from "@phosphor-icons/react";
import { Button, Input, Select } from "@vayva/ui";
import { MobileTransactionCard } from "@/components/transactions/MobileTransactionCard";
import { Transaction, TransactionsResponse } from "@/types/finance";
import { apiJson } from "@/lib/api-client-shared";

function isCreditType(type: Transaction["type"]) {
  return type === "CHARGE";
}

function TypeBadge({ type }: { type: Transaction["type"] }) {
  const label =
    type === "CHARGE" ? "Charge" : type === "REFUND" ? "Refund" : "Payout";
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">
      {label}
    </span>
  );
}

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

  // Calculate metrics
  const totalTransactions = transactions.length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const credits = transactions.filter((t) => isCreditType(t.type)).length;
  const debits = transactions.filter((t) => !isCreditType(t.type)).length;
  const avgTransaction = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <span className="sr-only">Loading transactions...</span>
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all financial transactions</p>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<RefreshCcw size={18} />}
          label="Total Transactions"
          value={String(totalTransactions)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<DollarSign size={18} />}
          label="Total Volume"
          value={formatCurrency(totalVolume)}
          trend="gross"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Credits"
          value={String(credits)}
          trend="income"
          positive
        />
        <SummaryWidget
          icon={<ArrowDownLeft size={18} />}
          label="Debits"
          value={String(debits)}
          trend="expenses"
          positive
        />
        <SummaryWidget
          icon={<DollarSign size={18} />}
          label="Avg Transaction"
          value={formatCurrency(avgTransaction)}
          trend="per tx"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white border-gray-200"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setStatusFilter('all');
            setTypeFilter('all');
            setDateRange('all');
            setSearchQuery('');
          }}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCcw size={16} className="inline mr-1" />
          Reset Filters
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <RefreshCcw size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No transactions found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isCreditType(tx.type)
                            ? "bg-green-50 text-green-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {isCreditType(tx.type) && (
                          <ArrowUpRight size={12} className="mr-1" />
                        )}
                        {!isCreditType(tx.type) && (
                          <ArrowDownLeft size={12} className="mr-1" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{tx.reference}</code>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          (tx as any).status === 'completed'
                            ? "bg-green-50 text-green-600"
                            : (tx as any).status === 'pending'
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {(tx as any).status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setSelectedTransaction(tx)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            className="bg-white  rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white  border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2
                id="transaction-modal-title"
                className="text-xl font-bold text-gray-900"
              >
                Transaction Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransaction(null)}
                className="h-9 w-9 hover:bg-gray-100 rounded-lg"
                aria-label="Close transaction details"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${selectedTransaction.status === "SUCCESS"
                    ? "bg-green-50 border border-green-500/20"
                    : (selectedTransaction as any).status === "FAILED"
                      ? "bg-red-500 border border-red-500/20"
                      : "bg-amber-50 border border-amber-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p
                      className={`text-lg font-bold ${selectedTransaction.status === "SUCCESS"
                          ? "text-green-600"
                          : (selectedTransaction as any).status === "FAILED"
                            ? "text-red-500"
                            : "text-amber-600"
                      }`}
                    >
                      {selectedTransaction.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
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
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Reference
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900 flex-1">
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
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Type
                  </p>
                  <TypeBadge type={selectedTransaction.type} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Date & Time
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Provider
                  </p>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedTransaction.provider}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                  className="flex-1 bg-text-green-600 text-white hover:bg-text-green-600/90"
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
