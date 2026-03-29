"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@vayva/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CreditCard, 
  TrendingUp, 
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Download
} from "lucide-react";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";

interface BNPLStats {
  totalAgreements: number;
  activeAgreements: number;
  completedAgreements: number;
  defaultedAgreements: number;
  totalValue: number;
  outstandingValue: number;
  avgOrderValue: number;
}

interface BNPLAgreement {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  provider: string;
  totalAmount: number;
  upfrontAmount: number;
  installmentAmount: number;
  numberOfInstallments: number;
  status: string;
  appliedAt: string;
  approvedAt?: string;
  installments: {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
    paidDate?: string;
  }[];
}

const PROVIDER_COLORS: Record<string, string> = {
  paystack: "bg-blue-500",
  carbon: "bg-green-500",
  credpal: "bg-purple-500",
};

const PROVIDER_NAMES: Record<string, string> = {
  paystack: "Paystack",
  carbon: "Carbon",
  credpal: "CredPal",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
  APPROVED: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-4 h-4" /> },
  ACTIVE: { color: "bg-green-100 text-green-800", icon: <TrendingUp className="w-4 h-4" /> },
  COMPLETED: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  DEFAULTED: { color: "bg-red-100 text-red-800", icon: <AlertTriangle className="w-4 h-4" /> },
  CANCELLED: { color: "bg-gray-100 text-gray-800", icon: <XCircle className="w-4 h-4" /> },
  REJECTED: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
};

export default function BNPLDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<BNPLStats | null>(null);
  const [agreements, setAgreements] = useState<BNPLAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedAgreement, setSelectedAgreement] = useState<BNPLAgreement | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ success: boolean; stats: typeof stats; agreements: typeof agreements }>(`/api/bnpl/dashboard?status=${filter}`);
      if (response.success) {
        setStats(response.stats);
        setAgreements(response.agreements || []);
      }
    } catch (error) {
      logger.error("[BNPL] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const getInstallmentProgress = (agreement: BNPLAgreement) => {
    const paid = agreement.installments.filter(i => i.status === "PAID").length;
    const total = agreement.numberOfInstallments;
    return { paid, total, percent: (paid / total) * 100 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buy Now Pay Later</h1>
          <p className="text-gray-500 mt-1">
            Manage installment payments and track customer agreements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Agreements</p>
                <p className="text-2xl font-bold">{stats.totalAgreements}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.outstandingValue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completedAgreements}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Defaults</p>
                <p className="text-2xl font-bold">{stats.defaultedAgreements}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={filter === "all" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === "active" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === "pending" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === "defaulted" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("defaulted")}
        >
          Defaulted
        </Button>
      </div>

      {/* Agreements Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b" scope="col">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Provider</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" scope="col">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agreements.map((agreement) => {
                const progress = getInstallmentProgress(agreement);
                const statusConfig = STATUS_CONFIG[agreement.status] || STATUS_CONFIG.PENDING;

                return (
                  <tr
                    key={agreement.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAgreement(agreement)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{agreement.customerName}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {agreement.customerPhone}
                          {agreement.customerEmail ? (
                            <span className="hidden sm:inline"> • {agreement.customerEmail}</span>
                          ) : null}
                        </p>
                        {agreement.customerEmail ? (
                          <p className="text-xs text-gray-500 truncate sm:hidden">
                            {agreement.customerEmail}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${PROVIDER_COLORS[agreement.provider]}`} />
                        <span className="text-sm">{PROVIDER_NAMES[agreement.provider]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{formatCurrency(agreement.totalAmount)}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(agreement.upfrontAmount)} upfront
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{progress.paid}/{progress.total}</span>
                          <span>{Math.round(progress.percent)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusConfig.color}>
                        <span className="flex items-center gap-1">
                          {statusConfig.icon}
                          {agreement.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(agreement.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {agreements.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No BNPL agreements found</h3>
            <p className="text-gray-500 mt-1">
              Agreements will appear here when customers apply for BNPL
            </p>
          </div>
        )}
      </Card>

      {/* Agreement Detail Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Agreement Details</h2>
                  <p className="text-gray-500">ID: {selectedAgreement.id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAgreement(null)}>
                  Close
                </Button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedAgreement.customerName}</p>
                  <p className="text-sm">{selectedAgreement.customerPhone}</p>
                  {selectedAgreement.customerEmail ? (
                    <p className="text-sm text-gray-600">{selectedAgreement.customerEmail}</p>
                  ) : null}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="font-medium">#{selectedAgreement.orderId.slice(-6)}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => router.push(`/orders?id=${selectedAgreement.orderId}`)}
                  >
                    View Order <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Installment Schedule */}
              <div>
                <h3 className="font-medium mb-3">Payment Schedule</h3>
                <div className="space-y-2">
                  {/* Upfront */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Upfront Payment</p>
                        <p className="text-sm text-gray-500">Paid at checkout</p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(selectedAgreement.upfrontAmount)}
                    </span>
                  </div>

                  {/* Installments */}
                  {selectedAgreement.installments.map((inst, idx) => (
                    <div
                      key={inst.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        inst.status === "PAID"
                          ? "bg-green-50 border-green-200"
                          : inst.status === "OVERDUE"
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {inst.status === "PAID" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : inst.status === "OVERDUE" ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">Installment {idx + 1}</p>
                          <p className="text-sm text-gray-500">
                            Due {new Date(inst.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(inst.amount)}</span>
                        {inst.status === "PAID" && inst.paidDate && (
                          <p className="text-xs text-green-600">
                            Paid {new Date(inst.paidDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
