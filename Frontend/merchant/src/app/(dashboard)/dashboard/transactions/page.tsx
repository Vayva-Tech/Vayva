"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  Funnel as Filter,
  MagnifyingGlass as Search,
  Wallet,
  TrendUp as TrendingUp,
  Clock,
} from "@phosphor-icons/react/ssr";

interface Transaction {
  id: string;
  type: "payment" | "payout" | "refund" | "fee" | "transfer";
  amount: number;
  status: "pending" | "completed" | "failed" | "reversed";
  description: string;
  customerName?: string;
  orderNumber?: string;
  paymentMethod?: string;
  settledAt?: string;
  createdAt: string;
  fee?: number;
  netAmount?: number;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  transactionCount: number;
  status: "pending" | "processing" | "completed";
  paidAt?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeTab, setActiveTab] = useState<"transactions" | "settlements">("transactions");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Transaction["type"] | "all">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txData, settleData] = await Promise.all([
        apiJson<{ transactions: Transaction[] }>("/transactions"),
        apiJson<{ settlements: Settlement[] }>("/settlements"),
      ]);
      setTransactions(txData.transactions || []);
      setSettlements(settleData.settlements || []);
    } catch (error) {
      logger.error("[TRANSACTIONS_FETCH_ERROR]", { error });
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalRevenue: transactions
      .filter((t) => t.type === "payment" && t.status === "completed")
      .reduce((sum: number, t) => sum + t.amount, 0),
    totalPayouts: transactions
      .filter((t) => t.type === "payout" && t.status === "completed")
      .reduce((sum: number, t) => sum + t.amount, 0),
    pendingBalance: transactions
      .filter((t) => t.status === "pending" && t.netAmount)
      .reduce((sum: number, t) => sum + (t.netAmount || 0), 0),
    totalFees: transactions
      .filter((t) => t.status === "completed")
      .reduce((sum: number, t) => sum + (t.fee || 0), 0),
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Transactions</h1>
            <p className="text-gray-500">Payments, payouts & settlements</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <ArrowDownLeft className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black text-black">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Payouts</p>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-black">
            ₦{stats.totalPayouts.toLocaleString()}
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Pending Balance</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-orange-600">
            ₦{stats.pendingBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Fees</p>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-gray-500">
            ₦{stats.totalFees.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white  rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        {(["transactions", "settlements"] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === t
                ? "bg-black text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === "transactions" && (
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Transaction["type"] | "all")}
            className="w-40"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="payout">Payouts</option>
            <option value="refund">Refunds</option>
            <option value="fee">Fees</option>
          </Select>
        </div>
      )}

      {/* Content */}
      <div className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : activeTab === "transactions" ? (
          <TransactionsTable transactions={filteredTransactions} />
        ) : (
          <SettlementsTable settlements={settlements} />
        )}
      </div>
    </div>
  );
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No transactions yet</h3>
        <p className="text-gray-700">
          Transactions will appear here when customers make payments
        </p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200" scope="col">
        <tr>
          <th className="text-left p-4 text-sm font-bold text-gray-700" scope="col">Transaction</th>
          <th className="text-left p-4 text-sm font-bold text-gray-700" scope="col">Type</th>
          <th className="text-left p-4 text-sm font-bold text-gray-700" scope="col">Status</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Amount</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {transactions.map((t) => (
          <tr key={t.id} className="hover:bg-white">
            <td className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    t.type === "payment"
                      ? "bg-green-100 text-green-600"
                      : t.type === "payout"
                      ? "bg-blue-100 text-blue-600"
                      : t.type === "refund"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.type === "payment" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : t.type === "payout" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.description}</p>
                  {t.orderNumber && (
                    <p className="text-xs text-gray-500">Order #{t.orderNumber}</p>
                  )}
                </div>
              </div>
            </td>
            <td className="p-4">
              <span className="text-sm capitalize">{t.type}</span>
            </td>
            <td className="p-4">
              <StatusBadge status={t.status} />
            </td>
            <td className="p-4 text-right">
              <p className="font-bold text-sm">₦{t.amount.toLocaleString()}</p>
              {t.fee !== undefined && (
                <p className="text-xs text-gray-500">
                  Fee: ₦{t.fee.toLocaleString()}
                </p>
              )}
            </td>
            <td className="p-4 text-right text-sm text-gray-700">
              {new Date(t.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SettlementsTable({ settlements }: { settlements: Settlement[] }) {
  if (settlements.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No settlements yet</h3>
        <p className="text-gray-700">
          Settlements are processed automatically based on your payout schedule
        </p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200" scope="col">
        <tr>
          <th className="text-left p-4 text-sm font-bold text-gray-700" scope="col">Period</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Transactions</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Gross</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Fees</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700" scope="col">Net</th>
          <th className="text-center p-4 text-sm font-bold text-gray-700" scope="col">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {settlements.map((s) => (
          <tr key={s.id} className="hover:bg-white">
            <td className="p-4">
              <p className="font-semibold text-sm">
                {new Date(s.periodStart).toLocaleDateString()} -{" "}
                {new Date(s.periodEnd).toLocaleDateString()}
              </p>
              {s.paidAt && (
                <p className="text-xs text-gray-500">
                  Paid {new Date(s.paidAt).toLocaleDateString()}
                </p>
              )}
            </td>
            <td className="p-4 text-right text-sm">{s.transactionCount}</td>
            <td className="p-4 text-right font-medium">
              ₦{s.totalAmount.toLocaleString()}
            </td>
            <td className="p-4 text-right text-red-600">₦{s.totalFees.toLocaleString()}</td>
            <td className="p-4 text-right font-bold text-green-600">
              ₦{s.netAmount.toLocaleString()}
            </td>
            <td className="p-4 text-center">
              <StatusBadge status={s.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "completed" | "failed" | "reversed" | "processing";
}) {
  const styles = {
    pending: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    reversed: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
