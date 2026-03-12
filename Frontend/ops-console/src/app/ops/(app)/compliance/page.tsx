"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import {
  ShieldCheck,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Warning,
  XCircle,
  ArrowsClockwise,
  Download,
  Database,
  Calendar,
  WarningCircle,
  FileArrowDown,
  ArrowSquareOut,
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface ComplianceAnalytics {
  overview: {
    totalMerchants: number;
    kycVerified: number;
    kycPending: number;
    kycFailed: number;
    dataExportRequests: number;
    pendingExports: number;
  };
  kycMetrics: {
    completionRate: number;
    avgVerificationTime: number;
    byIndustry: { industry: string; verified: number; total: number }[];
  };
  dataRetention: {
    merchantsWithOldData: number;
    dataReadyForDeletion: number;
    storageUsed: string;
  };
  exportRequests: {
    id: string;
    storeId: string;
    storeName: string;
    type: string;
    status: string;
    requestedAt: string;
    completedAt: string | null;
  }[];
  regulatoryReports: {
    report: string;
    lastGenerated: string;
    status: string;
    nextDue: string;
  }[];
}

export default function CompliancePage(): React.JSX.Element {
  const { data: compliance, isLoading, refetch } = useOpsQuery<ComplianceAnalytics>(
    ["compliance"],
    () =>
      fetch("/api/ops/compliance/exports").then((res) =>
        res.json().then((j) => j.data),
      ),
    { refetchInterval: 300000 },
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UP_TO_DATE":
        return "bg-green-100 text-green-700";
      case "DUE_SOON":
        return "bg-yellow-100 text-yellow-700";
      case "OVERDUE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getExportStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <OpsPageShell
        title="Compliance Dashboard"
        description="KYC, data exports, and regulatory reporting"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Compliance Dashboard"
      description="KYC, data exports, and regulatory reporting"
      headerActions={
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowsClockwise className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      }
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">KYC Verified</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {compliance?.overview.kycVerified.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {compliance?.kycMetrics.completionRate.toFixed(1) || 0}% completion rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">KYC Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {compliance?.overview.kycPending.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avg {compliance?.kycMetrics.avgVerificationTime || 0}h to verify
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Data Export Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {compliance?.overview.dataExportRequests || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileArrowDown className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {compliance?.overview.pendingExports || 0} pending
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {compliance?.dataRetention.storageUsed || "0 TB"}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {compliance?.dataRetention.dataReadyForDeletion || 0} ready for deletion
          </p>
        </div>
      </div>

      {/* KYC Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            KYC Status Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Verified</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {compliance?.overview.kycVerified || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-lg font-bold text-yellow-700">
                {compliance?.overview.kycPending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Failed/Rejected</span>
              </div>
              <span className="text-lg font-bold text-red-700">
                {compliance?.overview.kycFailed || 0}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-3">KYC by Industry</h4>
            <div className="space-y-2">
              {compliance?.kycMetrics.byIndustry.map((industry) => {
                const percentage = industry.total > 0 ? (industry.verified / industry.total) * 100 : 0;
                return (
                  <div key={industry.industry} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{industry.industry}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-16 text-right">
                        {industry.verified}/{industry.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regulatory Reports */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Regulatory Reports
          </h3>
          <div className="space-y-3">
            {compliance?.regulatoryReports.map((report) => (
              <div key={report.report} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-gray-900">{report.report}</div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(report.status)}`}>
                    {report.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    Next due: {new Date(report.nextDue).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <WarningCircle className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">Compliance Notice</span>
            </div>
            <p className="text-sm text-indigo-700">
              Quarterly Privacy Audit is overdue. Please generate and submit the report as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Data Export Requests */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            Data Export Requests
          </h3>
          <Link
            href="/ops/compliance/exports/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            New Export
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compliance?.exportRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ops/merchants/${req.storeId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {req.storeName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getExportStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {req.status === "COMPLETED" ? (
                      <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        <Download size={14} />
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!compliance?.exportRequests || compliance.exportRequests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No export requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Data Retention Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Suspended Merchants (1y+)</div>
            <div className="text-2xl font-bold text-gray-900">
              {compliance?.dataRetention.merchantsWithOldData || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Eligible for data deletion</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Data Ready for Deletion</div>
            <div className="text-2xl font-bold text-gray-900">
              {compliance?.dataRetention.dataReadyForDeletion || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Merchants with expired retention</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Storage Optimization</div>
            <div className="text-2xl font-bold text-gray-900">
              {compliance?.dataRetention.storageUsed || "0 TB"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current total storage</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Review Deletion Queue
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Export Retention Report
          </button>
        </div>
      </div>
    </OpsPageShell>
  );
}
